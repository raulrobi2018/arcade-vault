import type { Metadata } from "next";
import { AuthForm } from "@/app/components/AuthForm";

export const metadata: Metadata = {
  title: "Iniciar sesión · Arcade Vault",
};

export default function LoginPage() {
  return (
    <div className="av-auth-wrap fade-in">
      <AuthForm />
    </div>
  );
}
