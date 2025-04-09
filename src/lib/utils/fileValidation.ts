import { Platform } from '../types/scheduled-post';

// Platform-specific size requirements
export const MEDIA_REQUIREMENTS = {
  instagram: {
    feed: {
      image: {
        minWidth: 320,
        maxWidth: 1440,
        minHeight: 320,
        maxHeight: 1440,
        aspectRatio: 1, // 1:1 square
        maxSize: 30 * 1024 * 1024, // 30MB
      },
      carousel: {
        minWidth: 320,
        maxWidth: 1440,
        minHeight: 320,
        maxHeight: 1440,
        aspectRatio: 1, // 1:1 square
        maxSize: 30 * 1024 * 1024, // 30MB per image
        maxCount: 10,
      },
      video: {
        minWidth: 320,
        maxWidth: 1440,
        minHeight: 320,
        maxHeight: 1440,
        aspectRatio: 1, // 1:1 square
        maxDuration: 60, // 60 seconds
        maxSize: 100 * 1024 * 1024, // 100MB
      },
    },
    reel: {
      video: {
        minWidth: 1080,
        maxWidth: 1920,
        minHeight: 1920,
        maxHeight: 1920,
        aspectRatio: 9/16, // 9:16 vertical
        maxDuration: 90, // 90 seconds
        maxSize: 250 * 1024 * 1024, // 250MB
      },
    },
  },
  youtube: {
    video: {
      maxSize: 128 * 1024 * 1024 * 1024, // 128GB
      maxDuration: 12 * 60 * 60, // 12 hours
    },
    thumbnail: {
      minWidth: 1280,
      minHeight: 720,
      aspectRatio: 16/9, // 16:9
      maxSize: 2 * 1024 * 1024, // 2MB
    },
  },
  tiktok: {
    video: {
      minWidth: 1080,
      maxWidth: 1920,
      minHeight: 1920,
      maxHeight: 1920,
      aspectRatio: 9/16, // 9:16 vertical
      maxDuration: 180, // 3 minutes
      maxSize: 512 * 1024 * 1024, // 512MB
    },
  },
} as const;

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export async function validateFile(
  file: File,
  platform: Platform,
  type: 'feed' | 'reel' | 'video' | 'thumbnail' = 'video'
): Promise<ValidationResult> {
  // Check file size
  const maxSize = getMaxFileSize(platform, type);
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `ファイルサイズが大きすぎます。最大${formatFileSize(maxSize)}まで。`,
    };
  }

  // For images and videos, check dimensions and duration
  if (file.type.startsWith('image/')) {
    return await validateImage(file, platform, type);
  } else if (file.type.startsWith('video/')) {
    return await validateVideo(file, platform, type);
  }

  return {
    isValid: false,
    error: '対応していないファイル形式です。',
  };
}

function getMaxFileSize(platform: Platform, type: string): number {
  switch (platform) {
    case 'instagram':
      if (type === 'feed') {
        return MEDIA_REQUIREMENTS.instagram.feed.video.maxSize;
      } else if (type === 'reel') {
        return MEDIA_REQUIREMENTS.instagram.reel.video.maxSize;
      }
      break;
    case 'youtube':
      if (type === 'video') {
        return MEDIA_REQUIREMENTS.youtube.video.maxSize;
      } else if (type === 'thumbnail') {
        return MEDIA_REQUIREMENTS.youtube.thumbnail.maxSize;
      }
      break;
    case 'tiktok':
      return MEDIA_REQUIREMENTS.tiktok.video.maxSize;
  }
  return 0;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function validateImage(
  file: File,
  platform: Platform,
  type: string
): Promise<ValidationResult> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let requirements;
      if (platform === 'instagram' && type === 'feed') {
        requirements = MEDIA_REQUIREMENTS.instagram.feed.image;
      } else if (platform === 'youtube' && type === 'thumbnail') {
        requirements = MEDIA_REQUIREMENTS.youtube.thumbnail;
      }

      if (!requirements) {
        resolve({
          isValid: false,
          error: '対応していない画像形式です。',
        });
        return;
      }

      // Check dimensions
      if (img.width < requirements.minWidth || img.height < requirements.minHeight) {
        resolve({
          isValid: false,
          error: `画像サイズが小さすぎます。最小${requirements.minWidth}x${requirements.minHeight}ピクセル必要です。`,
        });
        return;
      }

      if (
        requirements.maxWidth &&
        requirements.maxHeight &&
        (img.width > requirements.maxWidth || img.height > requirements.maxHeight)
      ) {
        resolve({
          isValid: false,
          error: `画像サイズが大きすぎます。最大${requirements.maxWidth}x${requirements.maxHeight}ピクセルまで。`,
        });
        return;
      }

      // Check aspect ratio
      const actualRatio = img.width / img.height;
      const expectedRatio = requirements.aspectRatio;
      const tolerance = 0.01; // 1% tolerance for aspect ratio

      if (Math.abs(actualRatio - expectedRatio) > tolerance) {
        resolve({
          isValid: false,
          error: `アスペクト比が正しくありません。${expectedRatio === 1 ? '1:1' : 
                 expectedRatio === 16/9 ? '16:9' : 
                 expectedRatio === 9/16 ? '9:16' : 
                 expectedRatio}が必要です。`,
        });
        return;
      }

      resolve({ isValid: true });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        isValid: false,
        error: '画像の読み込みに失敗しました。',
      });
    };

    img.src = objectUrl;
  });
}

async function validateVideo(
  file: File,
  platform: Platform,
  type: string
): Promise<ValidationResult> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const objectUrl = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);

      let requirements;
      if (platform === 'instagram') {
        requirements = type === 'feed' 
          ? MEDIA_REQUIREMENTS.instagram.feed.video
          : MEDIA_REQUIREMENTS.instagram.reel.video;
      } else if (platform === 'youtube') {
        requirements = MEDIA_REQUIREMENTS.youtube.video;
      } else if (platform === 'tiktok') {
        requirements = MEDIA_REQUIREMENTS.tiktok.video;
      }

      if (!requirements) {
        resolve({
          isValid: false,
          error: '対応していない動画形式です。',
        });
        return;
      }

      // Check duration
      if (video.duration > requirements.maxDuration) {
        resolve({
          isValid: false,
          error: `動画が長すぎます。最大${requirements.maxDuration}秒まで。`,
        });
        return;
      }

      // For platforms with specific dimension requirements
      if (requirements.minWidth && requirements.minHeight) {
        if (video.videoWidth < requirements.minWidth || video.videoHeight < requirements.minHeight) {
          resolve({
            isValid: false,
            error: `動画サイズが小さすぎます。最小${requirements.minWidth}x${requirements.minHeight}ピクセル必要です。`,
          });
          return;
        }

        if (
          requirements.maxWidth &&
          requirements.maxHeight &&
          (video.videoWidth > requirements.maxWidth || video.videoHeight > requirements.maxHeight)
        ) {
          resolve({
            isValid: false,
            error: `動画サイズが大きすぎます。最大${requirements.maxWidth}x${requirements.maxHeight}ピクセルまで。`,
          });
          return;
        }

        // Check aspect ratio
        const actualRatio = video.videoWidth / video.videoHeight;
        const expectedRatio = requirements.aspectRatio;
        const tolerance = 0.01; // 1% tolerance for aspect ratio

        if (Math.abs(actualRatio - expectedRatio) > tolerance) {
          resolve({
            isValid: false,
            error: `アスペクト比が正しくありません。${expectedRatio === 1 ? '1:1' : 
                   expectedRatio === 16/9 ? '16:9' : 
                   expectedRatio === 9/16 ? '9:16' : 
                   expectedRatio}が必要です。`,
          });
          return;
        }
      }

      resolve({ isValid: true });
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        isValid: false,
        error: '動画の読み込みに失敗しました。',
      });
    };

    video.src = objectUrl;
  });
}