/*
  # Add prompt templates table

  1. New Tables
    - `prompt_templates`
      - `id` (uuid, primary key)
      - `platform` (platform_type)
      - `model` (text)
      - `type` (text)
      - `prompt` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `prompt_templates` table
    - Add policies for admins to manage templates
    - Add policies for users to read templates
*/

-- Create prompt templates table
CREATE TABLE IF NOT EXISTS prompt_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform platform_type NOT NULL,
  model text NOT NULL,
  type text NOT NULL,
  prompt text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access for authenticated users"
  ON prompt_templates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow all access for admins"
  ON prompt_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_prompt_templates_updated_at
  BEFORE UPDATE ON prompt_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default templates
INSERT INTO prompt_templates (platform, model, type, prompt) VALUES
  ('instagram', 'gpt4', 'feed', 'Create an engaging Instagram feed post about {topic}. Include:
1. Attention-grabbing first line
2. Main content with value proposition
3. Call to action
4. Relevant hashtags (max 30)
5. Emoji usage for visual appeal

Consider:
- Instagram''s character limit
- Mobile-first viewing
- Visual description compatibility
- Engagement triggers'),

  ('instagram', 'gpt4', 'reel', 'Create an Instagram Reel script about {topic}. Structure:
1. Hook (first 3 seconds)
2. Content outline (15-30 seconds)
3. Key points for overlay text
4. Background music suggestions
5. Call to action
6. Hashtags

Focus on:
- Vertical format
- Fast-paced content
- Trending audio compatibility
- Pattern interrupts'),

  ('youtube', 'gpt4', 'video', 'Create a YouTube video script about {topic}. Include:
1. Hook (first 30 seconds)
2. Introduction
3. Main content sections
4. Timestamps
5. Call to action
6. End screen suggestions
7. Description with chapters

Consider:
- SEO optimization
- Audience retention
- YouTube algorithm
- Monetization guidelines'),

  ('tiktok', 'gpt4', 'video', 'Create a TikTok video script about {topic}. Structure:
1. Hook (first 3 seconds)
2. Main content (15-60 seconds)
3. Text overlay points
4. Sound effects timing
5. Trending audio suggestions
6. Call to action

Focus on:
- Vertical format
- Pattern interrupts
- Trending sounds
- Viral triggers');