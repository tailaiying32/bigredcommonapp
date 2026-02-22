export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "interviewing"
  | "accepted"
  | "rejected";

export type TeamRole = "admin" | "reviewer";

export type SenderType = "team" | "applicant";

export type TeamQuestion = {
  id: string;
  label: string;
  type: "text" | "textarea" | "select";
  required: boolean;
  options?: string[];
};

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          netid: string;
          email: string;
          full_name: string;
          major: string | null;
          grad_year: number | null;
          gpa: number | null;
          resume_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          netid: string;
          email: string;
          full_name: string;
          major?: string | null;
          grad_year?: number | null;
          gpa?: number | null;
          resume_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          netid?: string;
          email?: string;
          full_name?: string;
          major?: string | null;
          grad_year?: number | null;
          gpa?: number | null;
          resume_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      teams: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string | null;
          website: string | null;
          custom_questions: Json;
          owner_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category?: string | null;
          website?: string | null;
          custom_questions?: Json;
          owner_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category?: string | null;
          website?: string | null;
          custom_questions?: Json;
          owner_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      team_members: {
        Row: {
          id: string;
          team_id: string;
          user_id: string;
          role: Database["public"]["Enums"]["team_role"];
          created_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          user_id: string;
          role?: Database["public"]["Enums"]["team_role"];
          created_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          user_id?: string;
          role?: Database["public"]["Enums"]["team_role"];
          created_at?: string;
        };
        Relationships: [];
      };
      applications: {
        Row: {
          id: string;
          student_id: string;
          team_id: string;
          status: Database["public"]["Enums"]["application_status"];
          answers: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          team_id: string;
          status?: Database["public"]["Enums"]["application_status"];
          answers?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          team_id?: string;
          status?: Database["public"]["Enums"]["application_status"];
          answers?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          application_id: string;
          sender_id: string;
          sender_type: Database["public"]["Enums"]["sender_type"];
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          sender_id: string;
          sender_type: Database["public"]["Enums"]["sender_type"];
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          sender_id?: string;
          sender_type?: Database["public"]["Enums"]["sender_type"];
          body?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      application_status: ApplicationStatus;
      team_role: TeamRole;
      sender_type: SenderType;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Convenience type aliases
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Team = Database["public"]["Tables"]["teams"]["Row"];
export type TeamMember = Database["public"]["Tables"]["team_members"]["Row"];
export type Application = Database["public"]["Tables"]["applications"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
