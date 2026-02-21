# ARCHITECTURE: Cornell Common (Project Team Unified Application)

## 1. System Overview
Cornell Common is a centralized application platform designed to replace the fragmented Google Form/website ecosystem used by Cornell project teams. 

### Core Personas
- **Applicants:** Students seeking to join teams. They maintain one "Global Profile" and submit team-specific responses.
- **Team Leads:** Reviewers who manage their team’s presence, define custom questions, and track applicant statuses.

---

## 2. Technical Stack
- **Frontend:** Next.js 14+ (App Router), Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI)
- **State & Forms:** React Hook Form + Zod (for strict validation)
- **Backend/Database:** Supabase (PostgreSQL + Auth + Storage)
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
| `questions` | jsonb | Array of objects: `[{id, label, type, required}]` |

### 3.3 Applications Table
The join table linking students to teams.
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `student_id` | uuid | Foreign Key -> Profiles |
| `team_id` | uuid | Foreign Key -> Teams |
| `status` | enum | `draft`, `submitted`, `interviewing`, `accepted`, `rejected` |
| `answers` | jsonb | Key-value pairs: `{"q1": "Answer string"}` |
| `created_at` | timestamp| Submission date |

---

## 4. Key Workflows

### 4.1 The Dynamic Form Engine
Instead of static forms, the application page must:
1. Fetch the `questions` JSONB from the **Teams** table.
2. Map over the array to render `input` or `textarea` components.
3. Validate responses against the `required` flag using Zod.
4. Save the results into the `answers` JSONB column in the **Applications** table.

### 4.2 Status Progression
Team leads need an interface to toggle the `status` field. Updating this field should trigger a UI update on the student's "My Applications" dashboard.

---

## 5. Security (Row Level Security)
- **Profiles:** Users can only read/write their own profile.
- **Applications:** - Students: Can read/write their own applications.
    - Team Leads: Can read applications where `team_id` matches their managed team.
- **Teams:** Publicly readable; writable only by users with a `team_admin` role (to be implemented via a `team_members` join table).

---

## 6. Implementation Phases (48h Sprint)
1. **Phase 1 (Hours 1-8):** Database initialization, Auth setup, and Profile creation flow.
2. **Phase 2 (Hours 9-18):** Team discovery page and Dynamic Application Form.
3. **Phase 3 (Hours 19-30):** Team Lead Dashboard (Table view with status toggles).
4. **Phase 4 (Hours 31-48):** Polish, Resume upload functionality, and Cornell branding.