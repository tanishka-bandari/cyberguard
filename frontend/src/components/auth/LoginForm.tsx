"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { useAuthRedirect } from "@/components/auth/useAuthRedirect";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useSession } from "@/hooks/useSession";
import { ApiError } from "@/lib/api/client";
import { login } from "@/lib/api/auth";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  useAuthRedirect();
  const { signIn } = useSession();
  const next = useSearchParams().get("next");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email")).trim();
    const password = String(data.get("password"));

    const found: typeof errors = {};
    if (!EMAIL_PATTERN.test(email)) found.email = "Enter a valid email address.";
    if (!password) found.password = "Enter your password.";
    setErrors(found);
    setServerError("");
    if (Object.keys(found).length) return;

    setBusy(true);
    try {
      signIn(await login(email, password));
    } catch (err) {
      const rejected = err instanceof ApiError && [400, 401, 403].includes(err.status);
      setServerError(rejected ? "Invalid email or password." : (err as Error).message);
      setBusy(false);
    }
  };

  const registerHref = next ? `/register?next=${encodeURIComponent(next)}` : "/register";

  return (
    <AuthCard
      title="Sign in"
      subtitle="Access the CyberGuard incident response platform."
      footer={
        <>
          New reporter?{" "}
          <Link href={registerHref} className="font-medium text-accent-text hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <Input name="email" label="Email" type="email" autoComplete="email" error={errors.email} autoFocus />
        <PasswordInput name="password" label="Password" autoComplete="current-password" error={errors.password} />
        {serverError && (
          <p role="alert" className="rounded-md border border-critical/50 bg-critical/10 px-3 py-2 text-sm text-critical-text">
            {serverError}
          </p>
        )}
        <Button type="submit" variant="primary" loading={busy} className="w-full">
          {busy ? "Signing in" : "Sign in"}
        </Button>
      </form>
    </AuthCard>
  );
}
