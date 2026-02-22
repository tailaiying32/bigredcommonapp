-- Applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  status application_status NOT NULL DEFAULT 'draft',
  answers JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(student_id, team_id)
);

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Students can read their own applications
CREATE POLICY "Students can read own applications"
  ON applications FOR SELECT
  USING (auth.uid() = student_id);

-- Team members can read their team's applications
CREATE POLICY "Team members can read team applications"
  ON applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = applications.team_id
        AND team_members.user_id = auth.uid()
    )
  );

-- Students can create applications
CREATE POLICY "Students can create applications"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Students can update their own draft applications
CREATE POLICY "Students can update own draft applications"
  ON applications FOR UPDATE
  USING (auth.uid() = student_id AND status = 'draft')
  WITH CHECK (auth.uid() = student_id);

-- Team admins can update application status
CREATE POLICY "Team admins can update application status"
  ON applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = applications.team_id
        AND team_members.user_id = auth.uid()
        AND team_members.role = 'admin'
    )
  );
