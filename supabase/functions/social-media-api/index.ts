import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'npm:@supabase/supabase-js';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const platform = url.searchParams.get('platform');
    const action = url.searchParams.get('action');
    const username = url.searchParams.get('username');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    if (!platform || !action || !username) {
      throw new Error('Missing required parameters');
    }

    let data;
    const credentials = await getCredentials(platform);

    switch (platform) {
      case 'instagram':
        data = await handleInstagram(action, username, credentials, startDate, endDate);
        break;
      case 'youtube':
        data = await handleYouTube(action, username, credentials, startDate, endDate);
        break;
      case 'tiktok':
        data = await handleTikTok(action, username, credentials, startDate, endDate);
        break;
      default:
        throw new Error('Invalid platform');
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function getCredentials(platform: string) {
  const { data, error } = await supabase
    .from(`${platform}_credentials`)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

async function handleInstagram(action: string, username: string, credentials: any, startDate?: string, endDate?: string) {
  // Instagram API implementation
  const response = await fetch(`https://graph.instagram.com/v12.0/${username}?fields=id,username,media_count,followers_count&access_token=${credentials.access_token}`);
  return await response.json();
}

async function handleYouTube(action: string, channelId: string, credentials: any, startDate?: string, endDate?: string) {
  // YouTube API implementation
  const response = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${credentials.api_key}`);
  return await response.json();
}

async function handleTikTok(action: string, username: string, credentials: any, startDate?: string, endDate?: string) {
  // TikTok API implementation
  const response = await fetch(`https://open.tiktokapis.com/v2/user/info/?fields=stats&access_token=${credentials.access_token}`);
  return await response.json();
}