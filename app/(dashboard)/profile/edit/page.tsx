import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile/profile-form";

export const metadata = {
  title: "Edit Profile | Cornell Common",
};

export default async function EditProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select()
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/profile/create");
  }

  return (
    <div className="flex items-center justify-center px-4 py-8">
      <ProfileForm email={user.email!} profile={profile} />
    </div>
  );
}
