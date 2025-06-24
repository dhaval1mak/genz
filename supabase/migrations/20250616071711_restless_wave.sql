/*
  # Add readings table for horoscope functionality

  1. New Tables
    - `readings`
      - `id` (uuid, primary key)
      - `anon_id` (uuid, nullable) - for anonymous users
      - `birth_date` (date, nullable)
      - `birth_time` (time, nullable)
      - `place` (text, nullable)
      - `forecast` (jsonb, nullable) - stores the generated reading
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `readings` table
    - Allow anonymous users to insert readings
    - Allow public read access for readings
*/

-- Create readings table
CREATE TABLE IF NOT EXISTS readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anon_id uuid,
  birth_date date,
  birth_time time,
  place text,
  forecast jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE readings ENABLE ROW LEVEL SECURITY;

-- Readings policies
CREATE POLICY "Anyone can insert readings"
  ON readings
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Readings are viewable by everyone"
  ON readings
  FOR SELECT
  USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_readings_created_at ON readings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_readings_anon_id ON readings(anon_id);