-- Fix infinite recursion in team_members RLS policy.
-- The old policy's EXISTS subquery on team_members triggers itself endlessly.
-- Solution: use a SECURITY DEFINER function to bypass RLS in the check.

CREATE OR REPLACE FUNCTION public.is_team_member(p_team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = p_team_id AND user_id = auth.uid()
  );
$$;

-- Drop the old recursive policy
DROP POLICY IF EXISTS "Team members are readable by team members" ON team_members;

-- Recreate without recursion
CREATE POLICY "Team members are readable by team members"
  ON team_members FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.is_team_member(team_id)
  );
