import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
import { format, eachDayOfInterval } from 'date-fns';
import { ja } from 'date-fns/locale/ja';

// データ型定義
interface PostData {
  postDate: string;
  postTime: string;
  thumbnail: string;
  caption: string;
  hashtags: string;
  impressions: number;
  reach: number;
  profileVisits: number;
  comments: number;
  likes: number;
  saves: number;
  retentionRate: number;
  postType?: 'フィード' | 'リール';
  carouselRetention?: number[];
  shares?: number;
  description?: string;
  engagementRate?: number;
  ctr?: number;
  newFollowers?: number;
}

interface AccountData {
  date: string;
  followers: number;
  followerChange: number;
  posts: number;
  impressions: number;
  reach: number;
  profileViews: number;
  websiteClicks: number;
  feedPosts?: number;
  reelPosts?: number;
  demographics: {
    age: Record<string, number>;
    gender: Record<string, number>;
    location: Record<string, number>;
  };
}

interface ExportData {
  accountMetrics: AccountData;
  posts: PostData[];
}

// プラットフォームごとのシート設定
const SHEET_CONFIGS = {
  instagram: {
    account: {
      name: 'アカウント分析',
      headers: [
        '日付',
        'フォロワー数',
        'フォロワー増減',
        'フィード投稿数',
        'リール投稿数',
        'インプレッション数',
        'リーチ数',
        'プロフィール閲覧数',
        'サイトクリック数'
      ],
      widths: [15, 12, 12, 12, 12, 15, 15, 15, 15],
      colors: {
        header: 'FF9C27B0',
        alternate: 'FFF3E5F5'
      }
    },
    posts: {
      name: '投稿分析',
      headers: [
        '投稿日時',
        '投稿種別',
        'サムネイル',
        'キャプション',
        'ハッシュタグ',
        'インプレッション数',
        'リーチ数',
        'プロフィール遷移数',
        'コメント数',
        'いいね数',
        '保存数',
        'エンゲージメント率'
      ],
      widths: [15, 10, 15, 40, 30, 15, 15, 15, 12, 12, 12, 15],
      colors: {
        header: 'FF9C27B0',
        alternate: 'FFF3E5F5'
      }
    }
  },
  youtube: {
    account: {
      name: 'アカウント分析',
      headers: [
        '日付',
        'チャンネル登録者数',
        '登録者増減',
        '投稿数',
        'インプレッション数',
        'リーチ数',
        'チャンネル閲覧数',
        '概要欄リンククリック数'
      ],
      widths: [15, 15, 12, 12, 15, 15, 15, 15],
      colors: {
        header: 'FFFF0000',
        alternate: 'FFFDE7E7'
      }
    },
    posts: {
      name: '投稿分析',
      headers: [
        '投稿日時',
        'サムネイル',
        '概要欄',
        'ハッシュタグ',
        'インプレッション数',
        'リーチ数',
        'チャンネル遷移数',
        'コメント数',
        'いいね数',
        'CTR'
      ],
      widths: [15, 15, 50, 30, 15, 15, 15, 12, 12, 15],
      colors: {
        header: 'FFFF0000',
        alternate: 'FFFDE7E7'
      }
    }
  },
  tiktok: {
    account: {
      name: 'アカウント分析',
      headers: [
        '日付',
        'フォロワー数',
        'フォロワー増減',
        '投稿数',
        'インプレッション数',
        'リーチ数',
        'プロフィール閲覧数',
        'サイトクリック数'
      ],
      widths: [15, 12, 12, 12, 15, 15, 15, 15],
      colors: {
        header: 'FF000000',
        alternate: 'FFF5F5F5'
      }
    },
    posts: {
      name: '投稿分析',
      headers: [
        '投稿日時',
        'サムネイル',
        'キャプション',
        'ハッシュタグ',
        'インプレッション数',
        'リーチ数',
        'プロフィール遷移数',
        'コメント数',
        'いいね数',
        '保存数',
        'シェア数',
        'フォロワー獲得数'
      ],
      widths: [15, 15, 40, 30, 15, 15, 15, 12, 12, 12, 12, 15],
      colors: {
        header: 'FF000000',
        alternate: 'FFF5F5F5'
      }
    }
  }
};

// モックデータ生成関数
const generateMockData = (platform: string, startDate: Date, endDate: Date): ExportData => {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  // アカウントデータ生成
  const accountMetrics: AccountData = {
    date: format(endDate, 'yyyy-MM-dd'),
    followers: Math.floor(Math.random() * 100000) + 10000,
    followerChange: Math.floor(Math.random() * 1000) - 200,
    posts: Math.floor(Math.random() * 500) + 100,
    impressions: Math.floor(Math.random() * 1000000) + 100000,
    reach: Math.floor(Math.random() * 500000) + 50000,
    profileViews: Math.floor(Math.random() * 10000) + 1000,
    websiteClicks: Math.floor(Math.random() * 5000) + 500,
    demographics: {
      age: {
        '13-17': Math.random() * 10,
        '18-24': Math.random() * 30,
        '25-34': Math.random() * 25,
        '35-44': Math.random() * 20,
        '45+': Math.random() * 15
      },
      gender: {
        '男性': Math.random() * 60,
        '女性': Math.random() * 40
      },
      location: {
        '東京': Math.random() * 30,
        '大阪': Math.random() * 20,
        '名古屋': Math.random() * 15,
        'その他': Math.random() * 35
      }
    }
  };

  if (platform === 'instagram') {
    accountMetrics.feedPosts = Math.floor(accountMetrics.posts * 0.6);
    accountMetrics.reelPosts = accountMetrics.posts - accountMetrics.feedPosts;
  }

  // 投稿データ生成
  const posts: PostData[] = days.map(date => {
    const basePost: PostData = {
      postDate: format(date, 'yyyy-MM-dd'),
      postTime: format(date, 'HH:mm'),
      thumbnail: `https://source.unsplash.com/random/400x400?sig=${date.getTime()}`,
      caption: `サンプル投稿 ${format(date, 'M/d')} #sample`,
      hashtags: '#viral #trending #social',
      impressions: Math.floor(Math.random() * 10000) + 1000,
      reach: Math.floor(Math.random() * 5000) + 500,
      profileVisits: Math.floor(Math.random() * 1000) + 100,
      comments: Math.floor(Math.random() * 200) + 20,
      likes: Math.floor(Math.random() * 2000) + 200,
      saves: Math.floor(Math.random() * 500) + 50,
      retentionRate: Math.floor(Math.random() * 40) + 60,
      engagementRate: Math.floor(Math.random() * 10) + 1,
      ctr: Math.floor(Math.random() * 15) + 5,
      newFollowers: Math.floor(Math.random() * 100) + 10
    };

    if (platform === 'instagram') {
      basePost.postType = Math.random() > 0.5 ? 'フィード' : 'リール';
    }

    return basePost;
  });

  return {
    accountMetrics,
    posts
  };
};

// Workbook作成関数
const createWorkbook = async (data: ExportData, platform: string) => {
  const workbook = new ExcelJS.Workbook();
  const config = SHEET_CONFIGS[platform as keyof typeof SHEET_CONFIGS];
  
  if (!config) return workbook;

  // アカウントデータのシート作成
  const accountSheet = workbook.addWorksheet(config.account.name);
  
  // ヘッダー設定
  accountSheet.addRow(config.account.headers);
  accountSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  accountSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: config.account.colors.header }
  };

  // データ行の追加
  const accountData = [
    data.accountMetrics.date,
    data.accountMetrics.followers,
    data.accountMetrics.followerChange,
    platform === 'instagram' ? data.accountMetrics.feedPosts : data.accountMetrics.posts,
    platform === 'instagram' ? data.accountMetrics.reelPosts : null,
    data.accountMetrics.impressions,
    data.accountMetrics.reach,
    data.accountMetrics.profileViews,
    data.accountMetrics.websiteClicks
  ].filter(Boolean);

  accountSheet.addRow(accountData);

  // 列幅の設定
  config.account.widths.forEach((width, i) => {
    accountSheet.getColumn(i + 1).width = width;
  });

  // 属性データをテーブル形式で追加
  accountSheet.addRow([]);
  accountSheet.addRow(['属性データ']);
  accountSheet.getRow(accountSheet.rowCount).font = { bold: true };

  // 年齢層データ
  accountSheet.addRow(['年齢層分布']);
  accountSheet.addRow(['年齢', '割合']);
  Object.entries(data.accountMetrics.demographics.age).forEach(([age, percentage]) => {
    accountSheet.addRow([age, `${percentage.toFixed(1)}%`]);
  });

  // 性別データ
  accountSheet.addRow([]);
  accountSheet.addRow(['性別分布']);
  accountSheet.addRow(['性別', '割合']);
  Object.entries(data.accountMetrics.demographics.gender).forEach(([gender, percentage]) => {
    accountSheet.addRow([gender, `${percentage.toFixed(1)}%`]);
  });

  // 地域データ
  accountSheet.addRow([]);
  accountSheet.addRow(['地域分布']);
  accountSheet.addRow(['地域', '割合']);
  Object.entries(data.accountMetrics.demographics.location).forEach(([location, percentage]) => {
    accountSheet.addRow([location, `${percentage.toFixed(1)}%`]);
  });

  // 投稿データのシート作成
  const postsSheet = workbook.addWorksheet(config.posts.name);
  
  // ヘッダー設定
  postsSheet.addRow(config.posts.headers);
  postsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  postsSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: config.posts.colors.header }
  };

  // データ行の追加
  data.posts.forEach((post, index) => {
    const row = [
      `${post.postDate} ${post.postTime}`,
      platform === 'instagram' ? post.postType : null,
      post.thumbnail,
      post.caption,
      post.hashtags,
      post.impressions.toLocaleString(),
      post.reach.toLocaleString(),
      post.profileVisits.toLocaleString(),
      post.comments.toLocaleString(),
      post.likes.toLocaleString(),
      post.saves.toLocaleString(),
      platform === 'instagram' ? `${post.engagementRate}%` :
      platform === 'youtube' ? `${post.ctr}%` :
      platform === 'tiktok' ? post.newFollowers?.toLocaleString() :
      null
    ].filter(Boolean);

    const dataRow = postsSheet.addRow(row);

    // 交互の行の背景色を設定
    if (index % 2 === 1) {
      dataRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: config.posts.colors.alternate }
      };
    }

    // 数値セルの配置を右寄せに
    row.forEach((_, colIndex) => {
      if (typeof row[colIndex] === 'number') {
        dataRow.getCell(colIndex + 1).alignment = { horizontal: 'right' };
      }
    });
  });

  // 列幅の設定
  config.posts.widths.forEach((width, i) => {
    postsSheet.getColumn(i + 1).width = width;
  });

  return workbook;
};

// エクスポート関数
export const exportReport = async (
  platform: string,
  startDate: string,
  endDate: string
) => {
  const data = generateMockData(
    platform,
    new Date(startDate),
    new Date(endDate)
  );
  
  const workbook = await createWorkbook(data, platform);
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `sns-report-${platform}-${startDate}-${endDate}.xlsx`);
};