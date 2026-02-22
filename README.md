# Cornell Project Team Common App (CPTCA)

A centralized application platform for Cornell University project teams — built to streamline how students discover teams, apply, and how team leaders manage applicants.

## Overview

CPTCA provides a unified application experience for Cornell project teams (analogous to a "common app" for student organizations). Students can browse teams, submit applications with custom per-team essay questions, track their application status, and message team reviewers — all from one place.

**User Roles:**
- **Students (Applicants)** — Browse teams, apply, track status, message teams
- **Team Owners** — Manage applications, configure deadlines, set custom questions, assign reviewers, write internal notes
- **Reviewers** — View assigned team's applications, message applicants, write internal notes

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router, Server Actions) |
| Language | TypeScript |
| Database & Auth | Supabase (PostgreSQL + Auth) |
| Styling | Tailwind CSS + shadcn/ui |
| Forms | React Hook Form + Zod |
| Email | AWS SES |
| Icons | Lucide React |

## Features

- **Team Discovery** — Browse all Cornell project teams with category filtering and animated showcase carousel
- **Dynamic Application Forms** — Each team defines custom essay questions stored as JSONB; the form engine renders them dynamically
- **Application Lifecycle** — Draft → Submitted → Interviewing → Accepted/Rejected with deadline enforcement
- **Per-Application Messaging** — Bidirectional message threads between applicants and team members, with email notifications via AWS SES
- **Internal Notes** — Team owners and reviewers can write, edit, and delete private per-application notes; note counts visible in the admin dashboard
- **Admin Dashboard** — Tabbed status filtering, message and note count badges per applicant row, reviewer assignment, separate upperclassman/lowerclassman deadlines
- **Email Notifications** — AWS SES notifications on status changes and new messages (team → applicant and applicant → team)
- **Role-Based Access Control** — Row-Level Security (RLS) policies enforce data isolation between users/teams
- **Cornell Branding** — Red (`#B31B1B`) color scheme, Cornell and Duffield Engineering logos, NetID-based identity
- **Mobile Responsive** — Hamburger nav, responsive admin table, mobile-first layout throughout
- **Resume Link** — Students can paste a resume URL (Google Drive, Dropbox, etc.) on their profile; viewable by team owners and reviewers on the review page

## Project Structure

```
bigredcommonapp/
├── app/                      # Next.js routes (App Router)
│   ├── (dashboard)/          # Protected routes with shared Header layout
│   │   ├── admin/[teamId]/   # Team owner/reviewer admin dashboard
│   │   ├── applications/     # Student's applications list
│   │   ├── dashboard/        # Student home
│   │   ├── profile/          # View/edit profile
│   │   └── teams/[id]/       # Team detail + application form
│   ├── auth/callback/        # OAuth callback
│   ├── login/                # Login page
│   ├── signup/               # Registration page
│   └── profile/create/       # Post-signup profile setup
├── components/               # Reusable UI components
│   ├── admin/                # Admin dashboard components (notes panel, status changer, reviewer manager)
│   ├── applications/         # Application form + status badge
│   ├── auth/                 # Login/signup forms
│   ├── layout/               # Header, mobile nav, user dropdown
│   ├── messages/             # Message thread UI
│   ├── profile/              # Profile form
│   ├── teams/                # Team card + marquee
│   └── ui/                   # shadcn/ui primitives
├── lib/
│   ├── actions/              # Server Actions (all DB mutations)
│   ├── email/                # AWS SES client + email templates
│   ├── supabase/             # Supabase client (browser, server, admin)
│   └── validations/          # Zod schemas
├── types/
│   └── database.ts           # Supabase database types
├── supabase/
│   ├── migrations/           # 14 SQL migration files
│   └── seed.sql              # Seed data
└── middleware.ts             # Route protection + session refresh
```

## Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | Student profiles (NetID, email, major, GPA, resume URL) |
| `teams` | Team metadata + `custom_questions` JSONB array + deadlines |
| `team_members` | Reviewer role assignments |
| `applications` | Applications with `answers` JSONB + status enum |
| `messages` | Per-application message threads |
| `notes` | Internal per-application notes for team owners and reviewers |

**Key design decisions:**
- `teams.custom_questions` — JSONB array of question objects (label, type, required)
- `applications.answers` — JSONB key-value map of question ID → answer
- `teams.upperclassman_deadline` / `teams.lowerclassman_deadline` — separate deadlines per class standing
- Cornell NetID is the primary human identifier for students
- All tables use Row-Level Security; students only see their own data
- Supabase admin client initialized lazily (function-scoped) to prevent build-time errors on Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- AWS account with SES configured (for email notifications)

### 1. Clone and install

```bash
git clone <repo-url>
cd bigredcommonapp
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# AWS SES (for email notifications)
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY_ID=your_aws_access_key
AWS_SES_SECRET_ACCESS_KEY=your_aws_secret_key
SES_FROM_EMAIL=your_verified_ses_email
```

### 3. Apply database migrations

Using the Supabase CLI:

```bash
supabase link --project-ref your-project-ref
supabase db push
```

Or run the SQL files in `/supabase/migrations/` in order via the Supabase dashboard SQL editor.

Optionally seed initial data:

```bash
# In the Supabase SQL editor, run:
supabase/seed.sql
supabase/seed_teams.sql
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Application Flow

```
Student signs up → Creates profile (NetID, major, GPA, resume link, etc.)
       ↓
Browses teams → Views team details & custom questions
       ↓
Starts application (saved as Draft)
       ↓
Submits before deadline → Status: Submitted
       ↓
Team owner reviews → Writes internal notes → Updates status (Interviewing / Accepted / Rejected)
       ↓
Email notification sent to student at each status change
```

**Messaging** is available at any point after an application is submitted, allowing back-and-forth between the applicant and the team. Both sides receive email notifications on new messages.

## Key Patterns

**Server Actions** — All database mutations go through Server Actions in `/lib/actions/`. No separate API routes.

**Dynamic form rendering** — `ApplicationForm` reads `teams.custom_questions` and builds a Zod schema + React Hook Form on the fly.

**Deadline enforcement** — Applications check `teams.upperclassman_deadline` / `teams.lowerclassman_deadline` against the student's `class_standing` before allowing submission.

**Role checks** — RLS policies enforce all authorization. The `team_members` table controls reviewer access; `teams.owner_id` controls admin access.

**Lazy admin client** — `getSupabaseAdmin()` creates the service-role Supabase client on demand inside server functions, avoiding module-level initialization errors during Vercel builds.

## Deployment

The recommended deployment target is [Vercel](https://vercel.com). Set all environment variables in the Vercel project settings before deploying.

For email: AWS SES must be moved out of sandbox mode (domain verification + production access request) before sending to unverified addresses.

## Known Limitations / TODO

- [ ] AWS SES production access (currently sandbox — only verified emails receive notifications)
- [ ] Notification preferences / unsubscribe
