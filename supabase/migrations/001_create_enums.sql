-- Enum for application status tracking
CREATE TYPE application_status AS ENUM (
  'draft',
  'submitted',
  'interviewing',
  'accepted',
  'rejected'
);

-- Enum for team member roles
CREATE TYPE team_role AS ENUM (
  'admin',
  'reviewer'
);
