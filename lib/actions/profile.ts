"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { profileSchema, type ProfileFormValues } from "@/lib/validations/profile";

export async function createProfile(values: ProfileFormValues) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    netid: parsed.data.netid,
    email: parsed.data.email,
    full_name: parsed.data.full_name,
    major: parsed.data.major || null,
    grad_year: parsed.data.grad_year || null,
    gpa: parsed.data.gpa || null,
    resume_url: parsed.data.resume_url || null,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function updateProfile(values: ProfileFormValues) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      netid: parsed.data.netid,
      email: parsed.data.email,
      full_name: parsed.data.full_name,
      major: parsed.data.major || null,
      grad_year: parsed.data.grad_year || null,
      gpa: parsed.data.gpa || null,
      resume_url: parsed.data.resume_url || null,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}
