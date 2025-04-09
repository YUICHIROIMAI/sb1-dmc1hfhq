import { supabase } from '../supabase';

interface TikTokCredentials {
  accessToken: string;
  openId: string;
}

export async function getTikTokAnalytics(startDate: string, endDate: string) {
  try {
    // Supabaseから認証情報を取得
    const { data: credentials, error } = await supabase
      .from('tiktok_credentials')
      .select('*')
      .single();

    if (error || !credentials) {
      throw new Error('TikTok credentials not found');
    }

    const response = await fetch(
      `https://open.tiktokapis.com/v2/video/list/?fields=id,title,statistics&access_token=${credentials.accessToken}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch TikTok data');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('TikTok API error:', error);
    throw error;
  }
}