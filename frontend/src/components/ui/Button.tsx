import type { ButtonHTMLAttributes } from "react";
import Autorenew from "@mui/icons-material/Autorenew";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-fg hover:brightness-110 border-transparent",
  secondary: "bg-panel text-fg border-border hover:bg-hover",
  ghost: "bg-transparent text-fg border-transparent hover:bg-hover",
  danger: "bg-critical-solid text-white border-transparent hover:brightness-110",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
};

// Also used to style links that look like buttons: <Link className={buttonClass()}>.
export function buttonClass(variant: ButtonVariant = "secondary", size: ButtonSize = "md") {
  return cn(
    "inline-flex shrink-0 items-center justify-center rounded-md border font-medium",
    "transition-colors disabled:cursor-not-allowed disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export function Button({
  variant,
  size,
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonClass(variant, size), className)}
      {...rest}
    >
      {loading && <Autorenew fontSize="inherit" className="animate-spin" />}
      {children}
    </button>
  );
}
