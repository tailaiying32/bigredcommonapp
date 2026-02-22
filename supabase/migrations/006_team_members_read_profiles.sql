-- Allow team members to read profiles of students who applied to their team
CREATE POLICY "Team members can read applicant profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM applications a
      JOIN team_members tm ON tm.team_id = a.team_id
      WHERE a.student_id = profiles.id
        AND tm.user_id = auth.uid()
    )
  );
