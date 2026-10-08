import type { ReactNode } from "react";
import { BrandMark } from "@/components/layout/BrandMark";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <main id="main" tabIndex={-1} className="grid min-h-dvh place-items-center p-4 outline-none">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center text-lg">
          <BrandMark />
        </div>
        <div className="rounded-lg border border-border bg-panel p-6">
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
          <div className="mt-5">{children}</div>
        </div>
        <p className="mt-4 text-center text-sm text-muted">{footer}</p>
      </div>
    </main>
  );
}
