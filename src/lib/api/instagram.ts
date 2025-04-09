import { supabase } from '../supabase';

interface InstagramCredentials {
  accessToken: string;
  userId: string;
}

export async function getInstagramInsights(startDate: string, endDate: string) {
  try {
    // Supabaseから認証情報を取得
    const { data: credentials, error } = await supabase
      .from('instagram_credentials')
      .select('*')
      .single();

    if (error || !credentials) {
      throw new Error('Instagram credentials not found');
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${credentials.userId}/media?fields=id,caption,media_type,timestamp,like_count,comments_count&access_token=${credentials.accessToken}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Instagram data');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Instagram API error:', error);
    throw error;
  }
}