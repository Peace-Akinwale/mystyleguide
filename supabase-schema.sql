-- Required for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create clips table
CREATE TABLE IF NOT EXISTS clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID,
  content_type TEXT NOT NULL CHECK (content_type IN ('text', 'url')),
  content TEXT NOT NULL,
  source_url TEXT,
  source_author TEXT,
  source_publication TEXT,
  user_notes TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  raw_html TEXT
);

-- Create analyses table
CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  clip_id UUID REFERENCES clips(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('individual', 'batch')),
  patterns JSONB,
  style_elements JSONB,
  claude_response TEXT NOT NULL
);

-- Create style_guides table
CREATE TABLE IF NOT EXISTS style_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  based_on_clip_ids UUID[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_clips_created_at ON clips(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clips_content_type ON clips(content_type);
CREATE INDEX IF NOT EXISTS idx_clips_tags ON clips USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_analyses_clip_id ON analyses(clip_id);
CREATE INDEX IF NOT EXISTS idx_style_guides_is_active ON style_guides(is_active);

-- Enable Row Level Security (optional, for future multi-user support)
ALTER TABLE clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE style_guides ENABLE ROW LEVEL SECURITY;

-- Recreate policies (allow all for now, can be restricted later)
DROP POLICY IF EXISTS "Enable all operations for all users" ON clips;
DROP POLICY IF EXISTS "Enable all operations for all users" ON analyses;
DROP POLICY IF EXISTS "Enable all operations for all users" ON style_guides;

CREATE POLICY "Enable all operations for all users" ON clips
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for all users" ON analyses
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for all users" ON style_guides
  FOR ALL USING (true) WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on style_guides
DROP TRIGGER IF EXISTS update_style_guides_updated_at ON style_guides;
CREATE TRIGGER update_style_guides_updated_at
  BEFORE UPDATE ON style_guides
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
