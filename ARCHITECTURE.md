# ARCHITECTURE: Cornell Common (Project Team Unified Application)

## 1. System Overview
Cornell Common is a centralized application platform designed to replace the fragmented Google Form/website ecosystem used by Cornell project teams.

### Core Personas
- **Applicants:** Students seeking to join teams. They maintain one "Global Profile" and submit team-specific responses.
- **Team Accounts:** Institutional accounts (e.g., `dti@cornell.edu`) that own a single team. Full admin access: review applications, change statuses, message applicants.
- **Reviewers:** Student accounts granted read-only access to a team's admin page. They can still browse teams and apply to other teams on the side.

### Account Model
- **Team accounts** have a 1:1 relationship with a team via `teams.owner_id`. They do not have a student profile. They only see their own team's admin page.
- **Reviewer accounts** are regular student accounts with an entry in `team_members`. They see the full student nav (Teams, My Applications) plus a "(Reviewer)" link to the team's admin page (read-only, no status changes).

---

## 2. Technical Stack
- **Frontend:** Next.js 14+ (App Router), Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI)
- **State & Forms:** React Hook Form + Zod (for strict validation)
- **Backend/Database:** Supabase (PostgreSQL + Auth + Storage)
- **Email:** Supabase Edge Functions + Resend (or similar)
- **Icons:** Lucide React

---

## 3. Data Model (PostgreSQL)

### 3.1 Profiles Table
Stores the "Common" information for every student.
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key (references auth.users) |
| `netid` | string | Unique Cornell Identifier |
| `email` | string | @cornell.edu address |
| `full_name` | string | Full legal name |
| `major` | string | Student's primary major |
| `grad_year` | integer | Expected graduation year |
| `gpa` | decimal | Optional/Required based on team |
| `resume_url` | text | Link to PDF in Supabase Storage |

### 3.2 Teams Table
Stores team-specific metadata and their dynamic form structure.
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `name` | string | Team Name (e.g., Cornell Rocketry) |
| `description`| text | Markdown-supported team bio |
| `category` | string | e.g., Engineering, Business, Social |
| `website` | text | External link to team site |
| `owner_id` | uuid | Foreign Key -> auth.users (the team's account) |
| `custom_questions` | jsonb | Array of objects: `[{id, label, type, required, options?}]` |

### 3.3 Team Members Table
Stores reviewer assignments (student accounts with read access to a team's admin page).
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `team_id` | uuid | Foreign Key -> Teams |
| `user_id` | uuid | Foreign Key -> auth.users |
| `role` | team_role | Currently only `reviewer` (admin is via `teams.owner_id`) |

### 3.4 Applications Table
The join table linking students to teams.
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `student_id` | uuid | Foreign Key -> auth.users |
| `team_id` | uuid | Foreign Key -> Teams |
| `status` | enum | `draft`, `submitted`, `interviewing`, `accepted`, `rejected` |
| `answers` | jsonb | Key-value pairs: `{"q1": "Answer string"}` |
| `created_at` | timestamp | Submission date |
| `updated_at` | timestamp | Last modified |

### 3.5 Messages Table (Phase 4)
Per-application message thread between a team and an applicant.
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `application_id` | uuid | Foreign Key -> Applications |
| `sender_id` | uuid | Foreign Key -> auth.users |
| `sender_type` | enum | `team` or `applicant` |
| `body` | text | Message content |
| `created_at` | timestamp | When the message was sent |

---

## 4. Key Workflows

### 4.1 The Dynamic Form Engine
Instead of static forms, the application page must:
1. Fetch the `custom_questions` JSONB from the **Teams** table.
2. Map over the array to render `input`, `textarea`, or `select` components.
3. Validate responses against the `required` flag using Zod.
4. Save the results into the `answers` JSONB column in the **Applications** table.

### 4.2 Status Progression
Team owners update the `status` field from the admin review page. Changing status triggers an email notification to the applicant.

### 4.3 Messaging
Teams and applicants communicate through per-application message threads. Sending a message triggers email notifications:
- **Team → Applicant:** Email sent to the applicant's @cornell.edu address.
- **Applicant → Team:** Email sent to the team's email + all reviewer emails for that team.

---

## 5. Security (Row Level Security)
- **Profiles:** Users can read/write their own profile. Team owners and reviewers can read profiles of students who applied to their team.
- **Applications:** Students can read/write their own. Team owners and reviewers can read their team's applications. Only team owners can update application status.
- **Teams:** Publicly readable. Only the team owner can update their team.
- **Messages:** Readable by the applicant and by the team owner/reviewers. Writable by the applicant (for their own application) and by the team owner.

---

## 6. Implementation Phases

### Phase 1: Foundation (COMPLETE)
- Database initialization (enums, profiles, teams, team_members, applications)
- Supabase Auth (signup, login, signout, email verification)
- Profile creation flow (React Hook Form + Zod)
- Basic dashboard layout with header and user nav
- Middleware route protection
- Seed data (3 teams, test users, sample applications)

### Phase 2: Core Product (COMPLETE)
- Team browsing page (`/teams`) with category filter
- Team detail page (`/teams/[id]`) with dynamic application form
- Application submission flow (draft → submit)
- My Applications page (`/applications`) with status badges
- Admin dashboard (`/admin/[teamId]`) with tabbed status filtering
- Application review page with status changer (owner-only)
- Header nav: student links vs team owner vs reviewer
- Team owner accounts redirect to admin on login

### Phase 3: Team Lead Dashboard (COMPLETE)
- Merged into Phase 2. Table view of applications, status toggles, reviewer read-only access.

### Phase 4: Polish, Messaging, and Branding

#### 4a. Mobile Navigation (COMPLETE)
- [x] Hamburger menu for mobile screens (Sheet component, slides from left)
- [x] Mobile-friendly admin dashboard (Select dropdown for status filter, responsive table columns)

#### 4b. Profile Editing (COMPLETE)
- [x] Add "Edit Profile" page accessible from dashboard/user nav
- [x] Re-use ProfileForm component with pre-filled values and `updateProfile` action

#### 4c. Application Flow Polish (COMPLETE)
- [x] Auto-redirect after creating a new draft (no "reload to continue" message)
- [x] Loading states/spinners on form submissions
- [x] Confirmation dialog before submitting application (can't undo)
- [x] Better empty states and error pages (404, unauthorized)
- [x] Cursor pointer on all interactive elements (tabs, buttons, dropdown items, avatar trigger, etc.)

#### 4d. Resume Upload
- [ ] Create Supabase Storage bucket (`resumes`) with RLS
- [ ] File upload component on profile form (PDF only, size limit)
- [ ] Store file path in `profiles.resume_url`
- [ ] Viewable/downloadable by team owners and reviewers on the review page

#### 4e. Messaging System
- [x] Create `messages` table with migration + RLS policies
- [x] Message thread UI on the application review page (visible to team owner + reviewers)
- [x] Message thread UI on the student's application detail view
- [x] Server actions: `sendMessage(applicationId, body)`
- [x] Real-time updates via Supabase Realtime subscriptions (or polling)
- [x] Unread message indicators

#### 4f. Email Notifications (COMPLETE)
- [x] Set up email provider (AWS SES via `@aws-sdk/client-ses`)
- [x] **Status change notification:** When a team updates an applicant's status, email the applicant
- [x] **Team → Applicant message notification:** When a team messages an applicant, email the applicant
- [x] **Applicant → Team message notification:** When an applicant messages a team, email the team account + all reviewer emails for that team
- [x] Email templates with Cornell branding (inline-styled HTML with #B31B1B header)
- [ ] Unsubscribe/notification preferences (future)

> **Note:** SES is currently in sandbox mode (can only send to verified email addresses). To go to production: (1) buy/verify a domain in SES, (2) request production access from AWS, (3) update `SES_FROM_EMAIL` to `noreply@yourdomain.com`.

#### 4g. Cornell Branding (COMPLETE)
- [x] Cornell red color scheme (`#B31B1B`) integrated into Tailwind theme (primary, ring, accent)
- [x] Updated landing page (`/`) with hero, features section, team showcase, and CTA
- [x] Cornell Duffield Engineering logo in header (light/dark variants)
- [x] Consistent typography and spacing

#### 4h. Reviewer Management
- [x] Team owner can add reviewers from admin page (by NetID or email)
- [x] Team owner can remove reviewers
- [x] Server actions: `addReviewer(teamId, email)`, `removeReviewer(teamId, userId)`

#### 4i. Deadlines (Stretch)
- [x] `deadline` column on teams table (nullable timestamp)
- [x] Display deadline on team detail page
- [x] Auto-disable application form after deadline passes
- [x] "Applications close in X days" badge on team cards

### Phase 5: Applicant Notes (COMPLETE)

Internal notes system so team admins and reviewers can keep per-applicant notes directly on the platform, replacing fragmented Google Drive docs.

#### 5a. Notes Backend
- [x] `notes` table: `id`, `application_id` (FK), `author_id` (FK), `body` (TEXT), `created_at`, `updated_at`
- [x] RLS: only team owner and reviewers can read/write notes for their team's applications
- [x] Server actions: `addNote(applicationId, body)`, `updateNote(noteId, body)`, `deleteNote(noteId)`

#### 5b. Notes UI — Application Detail Page
- [x] Notes section on admin application detail page (below messages)
- [x] Add note form (textarea + submit button)
- [x] List of existing notes with author name, timestamp, and body
- [x] Edit/delete own notes (inline editing)
- [x] Reviewers can add and view notes but not delete others' notes

#### 5c. Notes Indicators
- [x] Note count badge on applications table (alongside message count)
- [x] "X notes" indicator on application row in admin dashboard
