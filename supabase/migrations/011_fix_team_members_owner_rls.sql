-- Fix broken INSERT/DELETE policies on team_members.
-- The old policies check for role = 'admin' in team_members, but since migration
-- 008 ownership is determined by teams.owner_id — no user has the admin role,
-- so inserts/deletes are blocked for everyone.

DROP POLICY IF EXISTS "Team admins can manage members" ON team_members;
DROP POLICY IF EXISTS "Team admins can remove members" ON team_members;

CREATE POLICY "Team owner can add members"
  ON team_members FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT owner_id FROM teams WHERE id = team_members.team_id)
  );

CREATE POLICY "Team owner can remove members"
  ON team_members FOR DELETE
  USING (
    auth.uid() = (SELECT owner_id FROM teams WHERE id = team_members.team_id)
  );
