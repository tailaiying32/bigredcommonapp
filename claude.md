# Project: Cornell Project Team Common App (CPTCA)

## Tech Stack
- Framework: Next.js 14+ (App Router)
- Language: TypeScript
- Auth/Database: Supabase (Auth + PostgreSQL)
- UI: Tailwind CSS, shadcn/ui, Lucide Icons
- Forms: React Hook Form + Zod

## Project Structure
- `/app`: Next.js routes and layouts
- `/components`: Shared UI components (shadcn)
- `/lib`: Supabase client, utility functions, validation schemas
- `/types`: TypeScript interfaces/database types

## Coding Rules
- Use Server Actions for all database mutations.
- Use 'use client' only when necessary for interactivity.
- Follow a "Mobile First" responsive design.
- Database: Use JSONB for team-specific essay questions and student answers.
- All Cornell NetIDs should be treated as the primary identifier for students.

## Database Patterns
- Teams define custom questions as an array of objects in `teams.custom_questions`.
- Applications store responses as a key-value pair in `applications.answers`.