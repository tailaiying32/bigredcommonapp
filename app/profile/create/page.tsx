import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile/profile-form";

export const metadata = {
  title: "Create Profile | Cornell Common",
};

export default async function CreateProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // If profile already exists, go to dashboard
  const { data: profile } = await supabase
    .from("profiles")
    .select()
    .eq("id", user.id)
    .single();

  if (profile) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <ProfileForm email={user.email!} />
    </div>
  );
}
