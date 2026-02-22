-- Add class standing to profiles and deadlines to teams.
-- Lowerclassmen (freshmen / first-year transfers) typically have later deadlines
-- than upperclassmen, so teams set two independent deadlines.

CREATE TYPE class_standing AS ENUM ('lowerclassman', 'upperclassman');

-- Nullable at DB level to avoid breaking existing profiles.
-- The app requires it for new/edited profiles going forward.
ALTER TABLE profiles ADD COLUMN class_standing class_standing;

-- Two independent deadline columns (nullable = no deadline set)
ALTER TABLE teams
  ADD COLUMN upperclassman_deadline TIMESTAMPTZ,
  ADD COLUMN lowerclassman_deadline TIMESTAMPTZ;
