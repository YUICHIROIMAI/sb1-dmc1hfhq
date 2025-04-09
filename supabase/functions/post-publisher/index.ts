import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js';
import { format, addMinutes } from 'npm:date-fns';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  try {
    // Check for scheduled posts that need to be published
    const now = new Date();
    const fiveMinutesFromNow = addMinutes(now, 5);

    const { data: posts, error } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('status', 'scheduled')
      .gte('scheduled_at', format(now, "yyyy-MM-dd'T'HH:mm:ssXXX"))
      .lte('scheduled_at', format(fiveMinutesFromNow, "yyyy-MM-dd'T'HH:mm:ssXXX"));

    if (error) throw error;

    if (!posts || posts.length === 0) {
      return new Response(JSON.stringify({ message: 'No posts to publish' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Process each post
    const results = await Promise.allSettled(
      posts.map(async (post) => {
        try {
          // Update status to processing
          await supabase
            .from('scheduled_posts')
            .update({ status: 'processing' })
            .eq('id', post.id);

          // Here you would implement the actual publishing logic
          // This is where you'd call the respective platform's API
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call

          // Update status to published
          await supabase
            .from('scheduled_posts')
            .update({ status: 'published' })
            .eq('id', post.id);

          return { id: post.id, status: 'published' };
        } catch (error) {
          // Update status to failed
          await supabase
            .from('scheduled_posts')
            .update({ status: 'failed' })
            .eq('id', post.id);

          throw error;
        }
      })
    );

    return new Response(
      JSON.stringify({
        message: 'Posts processed',
        results
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});