import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Sign In | Cornell Common",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <LoginForm />
    </div>
  );
}
