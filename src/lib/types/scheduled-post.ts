import { z } from 'zod';

// Platform specific content schemas
export const InstagramPostSchema = z.object({
  type: z.enum(['feed', 'reel']),
  media: z.array(z.string().url()),
  caption: z.string().max(2200), // Instagram caption limit
  hashtags: z.array(z.string()),
  location: z.string().optional(),
  userTags: z.array(z.string()).optional(),
  firstComment: z.string().optional(), // For additional hashtags
  hideLikes: z.boolean().optional(),
  hideComments: z.boolean().optional()
});

export const YouTubePostSchema = z.object({
  title: z.string().max(100), // YouTube title limit
  description: z.string().max(5000), // YouTube description limit
  tags: z.array(z.string()).max(500), // YouTube tags limit
  videoFile: z.string().url(),
  thumbnail: z.string().url().optional(),
  playlist: z.string().optional(),
  privacyStatus: z.enum(['private', 'unlisted', 'public']),
  category: z.string().optional(),
  language: z.string().optional(),
  madeForKids: z.boolean().optional(),
  license: z.string().optional(),
  allowComments: z.boolean().optional(),
  allowRatings: z.boolean().optional()
});

export const TikTokPostSchema = z.object({
  videoFile: z.string().url(),
  description: z.string().max(2200), // TikTok description limit
  hashtags: z.array(z.string()),
  allowComments: z.boolean().optional(),
  allowDuet: z.boolean().optional(),
  allowStitch: z.boolean().optional(),
  visibility: z.enum(['public', 'friends', 'private']).optional(),
  disableDownload: z.boolean().optional(),
  backgroundMusic: z.string().optional(),
  allowReactions: z.boolean().optional()
});

// Combined schema for all post types
export const ScheduledPostSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  platform: z.enum(['instagram', 'youtube', 'tiktok']),
  scheduledAt: z.string().datetime(),
  status: z.enum(['scheduled', 'processing', 'published', 'failed', 'cancelled']),
  content: z.discriminatedUnion('platform', [
    z.object({ platform: z.literal('instagram'), data: InstagramPostSchema }),
    z.object({ platform: z.literal('youtube'), data: YouTubePostSchema }),
    z.object({ platform: z.literal('tiktok'), data: TikTokPostSchema })
  ])
});

export type InstagramPost = z.infer<typeof InstagramPostSchema>;
export type YouTubePost = z.infer<typeof YouTubePostSchema>;
export type TikTokPost = z.infer<typeof TikTokPostSchema>;
export type ScheduledPost = z.infer<typeof ScheduledPostSchema>;