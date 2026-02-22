-- =============================================================================
-- SEED DATA for Cornell Common
-- Run this in the Supabase SQL Editor after all migrations have been applied.
--
-- PREREQUISITE: Create these users via Supabase Dashboard > Authentication >
-- Users > Add User (with "Auto Confirm User" checked), all with password: testpass123
--
-- TEAM ACCOUNTS (one per team — these are institutional, not personal):
--   dti@cornell.edu       →  Cornell DTI team account
--   rocketry@cornell.edu  →  Cornell Rocketry team account
--   appdev@cornell.edu    →  Cornell AppDev team account
--
-- STUDENT ACCOUNTS:
--   az123@cornell.edu  →  Alice Zhang   (DTI reviewer)
--   cd789@cornell.edu  →  Carol Davis   (Applicant)
--   dk012@cornell.edu  →  Dave Kim      (Applicant)
--   em345@cornell.edu  →  Eve Martinez  (Applicant)
--
-- Then update the UUIDs below to match the ones from the Dashboard.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- User UUID mapping (update these after creating users in Dashboard)
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  -- Team accounts
  dti_owner_id      UUID := '285bac04-ad35-402d-8bbb-f52b18a34575';
  rocketry_owner_id UUID := '00000000-0000-0000-0000-000000000002';
  appdev_owner_id   UUID := '00000000-0000-0000-0000-000000000003';

  -- Student accounts
  alice_id UUID := 'fc4540eb-e436-4150-a394-c2072938af5a';
  carol_id UUID := '033a2d20-b780-453b-bb86-efd08c8b7615';
  dave_id  UUID := '09f6cb02-acd4-4462-b554-7bf45de2a597';
  eve_id   UUID := 'b74feed9-6e33-411e-bd72-2bf09bd5fdd5';

  dti_id      UUID := gen_random_uuid();
  rocketry_id UUID := gen_random_uuid();
  appdev_id   UUID := gen_random_uuid();
BEGIN

  -- -------------------------------------------------------------------------
  -- 1. Create student profiles (team accounts do NOT get profiles)
  -- -------------------------------------------------------------------------
  INSERT INTO profiles (id, netid, email, full_name, major, grad_year, gpa) VALUES
    (alice_id, 'az123', 'az123@cornell.edu', 'Alice Zhang', 'Computer Science', 2026, 3.85),
    (carol_id, 'cd789', 'cd789@cornell.edu', 'Carol Davis', 'Information Science', 2026, 3.92),
    (dave_id,  'dk012', 'dk012@cornell.edu', 'Dave Kim', 'Computer Science', 2027, 3.60),
    (eve_id,   'em345', 'em345@cornell.edu', 'Eve Martinez', 'ECE', 2027, 3.75);

  -- -------------------------------------------------------------------------
  -- 2. Create project teams with owner_id (team account) + custom questions
  -- -------------------------------------------------------------------------
  INSERT INTO teams (id, name, description, category, website, owner_id, custom_questions) VALUES
  (
    dti_id,
    'Cornell Design & Tech Initiative',
    'A project team that builds products to improve the lives of those in the Cornell community and beyond.',
    'Technology',
    'https://cornelldti.org',
    dti_owner_id,
    '[
      {"id": "q1", "label": "Why do you want to join DTI?", "type": "textarea", "required": true},
      {"id": "q2", "label": "What role are you applying for?", "type": "select", "required": true, "options": ["Developer", "Designer", "PM", "Business Analyst"]},
      {"id": "q3", "label": "Link to your portfolio or GitHub", "type": "text", "required": false}
    ]'
  ),
  (
    rocketry_id,
    'Cornell Rocketry',
    'We design, build, and launch high-powered rockets to compete in the Spaceport America Cup.',
    'Engineering',
    'https://cornellrocketry.com',
    rocketry_owner_id,
    '[
      {"id": "q1", "label": "What subteam interests you most?", "type": "select", "required": true, "options": ["Propulsion", "Structures", "Avionics", "Recovery", "Payload"]},
      {"id": "q2", "label": "Describe any relevant engineering experience.", "type": "textarea", "required": true},
      {"id": "q3", "label": "Are you comfortable working in the machine shop?", "type": "select", "required": true, "options": ["Yes", "No", "Willing to learn"]}
    ]'
  ),
  (
    appdev_id,
    'Cornell AppDev',
    'An engineering project team that builds apps to improve student life at Cornell.',
    'Technology',
    'https://cornellappdev.com',
    appdev_owner_id,
    '[
      {"id": "q1", "label": "Which platform are you interested in?", "type": "select", "required": true, "options": ["iOS", "Android", "Backend", "Design", "Marketing"]},
      {"id": "q2", "label": "Tell us about a project you are proud of.", "type": "textarea", "required": true}
    ]'
  );

  -- -------------------------------------------------------------------------
  -- 3. Assign reviewers (student accounts with read access to admin pages)
  -- -------------------------------------------------------------------------
  INSERT INTO team_members (team_id, user_id, role) VALUES
    (dti_id, alice_id, 'reviewer');  -- Alice is a DTI reviewer

  -- -------------------------------------------------------------------------
  -- 4. Create sample applications
  -- -------------------------------------------------------------------------
  INSERT INTO applications (student_id, team_id, status, answers) VALUES
    -- Dave applied to DTI (submitted)
    (dave_id, dti_id, 'submitted',
     '{"q1": "I love building products that help students. DTI aligns with my passion for using tech for good.", "q2": "Developer", "q3": "https://github.com/davekim"}'),
    -- Dave has a draft application for Rocketry
    (dave_id, rocketry_id, 'draft',
     '{"q1": "Avionics", "q2": ""}'),
    -- Eve applied to DTI (interviewing)
    (eve_id, dti_id, 'interviewing',
     '{"q1": "I want to gain real-world product experience while making an impact on campus.", "q2": "Designer", "q3": "https://evemartinez.design"}'),
    -- Eve applied to AppDev (submitted)
    (eve_id, appdev_id, 'submitted',
     '{"q1": "iOS", "q2": "I built a meal tracking app for my family that syncs across devices using CloudKit."}');

END $$;
