CREATE TYPE sender_type AS ENUM ('team', 'applicant');

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_type sender_type NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_messages_application_id ON messages(application_id);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Applicant can read their own application's messages
CREATE POLICY "Applicant can read own application messages"
  ON messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM applications
    WHERE applications.id = messages.application_id
      AND applications.student_id = auth.uid()
  ));

-- Team owner can read their team's application messages
CREATE POLICY "Team owner can read team application messages"
  ON messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM applications a
    JOIN teams t ON t.id = a.team_id
    WHERE a.id = messages.application_id
      AND t.owner_id = auth.uid()
  ));

-- Reviewers can read their team's application messages
CREATE POLICY "Reviewers can read team application messages"
  ON messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM applications a
    JOIN team_members tm ON tm.team_id = a.team_id
    WHERE a.id = messages.application_id
      AND tm.user_id = auth.uid()
  ));

-- Applicant can send on their own applications (must be sender_type = 'applicant')
CREATE POLICY "Applicant can send messages on own applications"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND sender_type = 'applicant'
    AND EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = messages.application_id
        AND applications.student_id = auth.uid()
    )
  );

-- Team owner can send on their team's applications (must be sender_type = 'team')
CREATE POLICY "Team owner can send messages on team applications"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND sender_type = 'team'
    AND EXISTS (
      SELECT 1 FROM applications a
      JOIN teams t ON t.id = a.team_id
      WHERE a.id = messages.application_id
        AND t.owner_id = auth.uid()
    )
  );
