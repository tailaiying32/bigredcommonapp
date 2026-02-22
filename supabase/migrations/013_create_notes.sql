-- Internal per-application notes for team owners and reviewers
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_notes_application_id ON notes(application_id);

-- Reuse the existing updated_at trigger function from 002
CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- SELECT: Team owner can read notes on their team's applications
CREATE POLICY "Team owner can read notes"
  ON notes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM applications a
    JOIN teams t ON t.id = a.team_id
    WHERE a.id = notes.application_id
      AND t.owner_id = auth.uid()
  ));

-- SELECT: Reviewers can read notes on their team's applications
CREATE POLICY "Reviewers can read notes"
  ON notes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM applications a
    JOIN team_members tm ON tm.team_id = a.team_id
    WHERE a.id = notes.application_id
      AND tm.user_id = auth.uid()
  ));

-- INSERT: Team owner can add notes
CREATE POLICY "Team owner can add notes"
  ON notes FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM applications a
      JOIN teams t ON t.id = a.team_id
      WHERE a.id = notes.application_id
        AND t.owner_id = auth.uid()
    )
  );

-- INSERT: Reviewers can add notes
CREATE POLICY "Reviewers can add notes"
  ON notes FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM applications a
      JOIN team_members tm ON tm.team_id = a.team_id
      WHERE a.id = notes.application_id
        AND tm.user_id = auth.uid()
    )
  );

-- UPDATE: Only the author can edit their own notes (with team access check)
CREATE POLICY "Author can update own notes"
  ON notes FOR UPDATE
  USING (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM applications a
      JOIN teams t ON t.id = a.team_id
      LEFT JOIN team_members tm ON tm.team_id = a.team_id AND tm.user_id = auth.uid()
      WHERE a.id = notes.application_id
        AND (t.owner_id = auth.uid() OR tm.user_id IS NOT NULL)
    )
  )
  WITH CHECK (
    auth.uid() = author_id
  );

-- DELETE: Only the author can delete their own notes (with team access check)
CREATE POLICY "Author can delete own notes"
  ON notes FOR DELETE
  USING (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM applications a
      JOIN teams t ON t.id = a.team_id
      LEFT JOIN team_members tm ON tm.team_id = a.team_id AND tm.user_id = auth.uid()
      WHERE a.id = notes.application_id
        AND (t.owner_id = auth.uid() OR tm.user_id IS NOT NULL)
    )
  );
