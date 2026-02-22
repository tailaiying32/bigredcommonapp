import { SignUpForm } from "@/components/auth/signup-form";

export const metadata = {
  title: "Sign Up | Cornell Common",
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <SignUpForm />
    </div>
  );
}
