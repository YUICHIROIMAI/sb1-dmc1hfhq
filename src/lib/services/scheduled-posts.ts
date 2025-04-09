import { supabase } from '../supabase';
import { ScheduledPost, ScheduledPostSchema } from '../types/scheduled-post';

export class ScheduledPostService {
  static async create(post: Omit<ScheduledPost, 'id'>) {
    try {
      // Validate post data
      ScheduledPostSchema.omit({ id: true }).parse(post);

      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert([{
          user_id: post.userId,
          platform: post.platform,
          scheduled_at: post.scheduledAt,
          status: post.status,
          content: post.content
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating scheduled post:', error);
      throw error;
    }
  }

  static async update(id: string, post: Partial<ScheduledPost>) {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .update({
          platform: post.platform,
          scheduled_at: post.scheduledAt,
          status: post.status,
          content: post.content
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating scheduled post:', error);
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting scheduled post:', error);
      throw error;
    }
  }

  static async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting scheduled post:', error);
      throw error;
    }
  }

  static async getByUserId(userId: string) {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', userId)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user scheduled posts:', error);
      throw error;
    }
  }

  static async getUpcoming(userId: string) {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'scheduled')
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting upcoming scheduled posts:', error);
      throw error;
    }
  }
}