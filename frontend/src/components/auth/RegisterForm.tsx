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
import { login, register } from "@/lib/api/auth";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = Partial<Record<"name" | "email" | "password" | "confirm", string>>;

function validate(name: string, email: string, password: string, confirm: string): Errors {
  const errors: Errors = {};
  if (name.length < 2) errors.name = "Enter your full name (at least 2 characters).";
  if (!EMAIL_PATTERN.test(email)) errors.email = "Enter a valid email address.";
  if (password.length < 8) errors.password = "Use at least 8 characters.";
  if (confirm !== password) errors.confirm = "Passwords do not match.";
  return errors;
}

export function RegisterForm() {
  useAuthRedirect();
  const { signIn } = useSession();
  const next = useSearchParams().get("next");
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name")).trim();
    const email = String(data.get("email")).trim();
    const password = String(data.get("password"));

    const found = validate(name, email, password, String(data.get("confirm")));
    setErrors(found);
    setServerError("");
    if (Object.keys(found).length) return;

    setBusy(true);
    try {
      await register(name, email, password);
      signIn(await login(email, password));
    } catch (err) {
      setServerError((err as Error).message);
      setBusy(false);
    }
  };

  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";

  return (
    <AuthCard
      title="Create an account"
      subtitle="Report security incidents and follow their progress."
      footer={
        <>
          Already have an account?{" "}
          <Link href={loginHref} className="font-medium text-accent-text hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <Input name="name" label="Full name" autoComplete="name" error={errors.name} autoFocus />
        <Input name="email" label="Email" type="email" autoComplete="email" error={errors.email} />
        <PasswordInput
          name="password"
          label="Password"
          autoComplete="new-password"
          hint="At least 8 characters."
          error={errors.password}
        />
        <PasswordInput name="confirm" label="Confirm password" autoComplete="new-password" error={errors.confirm} />
        {serverError && (
          <p role="alert" className="rounded-md border border-critical/50 bg-critical/10 px-3 py-2 text-sm text-critical-text">
            {serverError}
          </p>
        )}
        <Button type="submit" variant="primary" loading={busy} className="w-full">
          {busy ? "Creating account" : "Create account"}
        </Button>
      </form>
    </AuthCard>
  );
}
