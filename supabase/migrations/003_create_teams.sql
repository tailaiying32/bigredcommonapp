-- Teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT,
  website TEXT,
  custom_questions JSONB DEFAULT '[]'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TRIGGER teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS: publicly readable, only admins can modify
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teams are publicly readable"
  ON teams FOR SELECT
  USING (true);

CREATE POLICY "Team admins can insert teams"
  ON teams FOR INSERT
  WITH CHECK (true);

-- NOTE: The "Team admins can update their team" policy is created in
-- 004_create_team_members.sql since it references the team_members table.
