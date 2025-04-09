/*
  # Create scheduled posts table and related tables

  1. New Tables
    - `scheduled_posts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `platform` (text)
      - `scheduled_at` (timestamp with time zone)
      - `status` (text)
      - `content` (jsonb)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own scheduled posts
*/

-- Create enum for post status
CREATE TYPE post_status AS ENUM (
  'scheduled',
  'processing',
  'published',
  'failed',
  'cancelled'
);

-- Create enum for platform type
CREATE TYPE platform_type AS ENUM (
  'instagram',
  'youtube',
  'tiktok'
);

-- Create scheduled posts table
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  platform platform_type NOT NULL,
  scheduled_at timestamptz NOT NULL,
  status post_status DEFAULT 'scheduled',
  content jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Add constraint to ensure scheduled_at is in the future
  CONSTRAINT scheduled_at_future CHECK (scheduled_at > now())
);

-- Enable RLS
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own scheduled posts"
  ON scheduled_posts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX scheduled_posts_user_id_idx ON scheduled_posts(user_id);
CREATE INDEX scheduled_posts_platform_idx ON scheduled_posts(platform);
CREATE INDEX scheduled_posts_status_idx ON scheduled_posts(status);
CREATE INDEX scheduled_posts_scheduled_at_idx ON scheduled_posts(scheduled_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_scheduled_posts_updated_at
  BEFORE UPDATE ON scheduled_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();