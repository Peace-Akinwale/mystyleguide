-- Migration: Add feedback table for editor corrections

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID,
  my_text TEXT NOT NULL,
  editor_feedback TEXT NOT NULL,
  context TEXT,
  tags TEXT[] DEFAULT '{}'
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

-- Enable Row Level Security
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Create policy (allow all for now)
DROP POLICY IF EXISTS "Enable all operations for all users" ON feedback;
CREATE POLICY "Enable all operations for all users" ON feedback
  FOR ALL USING (true) WITH CHECK (true);
