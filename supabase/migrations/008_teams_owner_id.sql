-- Add owner_id to teams: each team has exactly one owner account (the team's email).
-- team_members is now only used for reviewers (student accounts with read access).

ALTER TABLE teams ADD COLUMN owner_id UUID REFERENCES auth.users(id);

-- Replace the old admin-based team update policy with owner-based
DROP POLICY IF EXISTS "Team admins can update their team" ON teams;

CREATE POLICY "Team owner can update their team"
  ON teams FOR UPDATE
  USING (auth.uid() = owner_id);

-- Team owner can read their team's applications
CREATE POLICY "Team owner can read team applications"
  ON applications FOR SELECT
  USING (
    auth.uid() = (SELECT owner_id FROM teams WHERE id = applications.team_id)
  );

-- Replace admin-based status update with owner-based
DROP POLICY IF EXISTS "Team admins can update application status" ON applications;

CREATE POLICY "Team owner can update application status"
  ON applications FOR UPDATE
  USING (
    auth.uid() = (SELECT owner_id FROM teams WHERE id = applications.team_id)
  );

-- Team owner can read applicant profiles
CREATE POLICY "Team owner can read applicant profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM applications a
      JOIN teams t ON t.id = a.team_id
      WHERE a.student_id = profiles.id
        AND t.owner_id = auth.uid()
    )
  );
