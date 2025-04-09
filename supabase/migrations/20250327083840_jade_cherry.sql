/*
  # Create API credentials tables

  1. New Tables
    - `instagram_credentials`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `access_token` (text)
      - `user_id` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `youtube_credentials`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `api_key` (text)
      - `channel_id` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `tiktok_credentials`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `access_token` (text)
      - `open_id` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own credentials
*/

-- Instagram Credentials Table
CREATE TABLE IF NOT EXISTS instagram_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  access_token text NOT NULL,
  instagram_user_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE instagram_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own Instagram credentials"
  ON instagram_credentials
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- YouTube Credentials Table
CREATE TABLE IF NOT EXISTS youtube_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  api_key text NOT NULL,
  channel_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE youtube_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own YouTube credentials"
  ON youtube_credentials
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- TikTok Credentials Table
CREATE TABLE IF NOT EXISTS tiktok_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  access_token text NOT NULL,
  open_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE tiktok_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own TikTok credentials"
  ON tiktok_credentials
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);