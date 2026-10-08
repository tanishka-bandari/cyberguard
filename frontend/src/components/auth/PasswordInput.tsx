"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/Input";

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  hint?: string;
  error?: string;
}

export function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      {...props}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
          className="rounded px-2 py-1 text-xs font-medium text-muted hover:text-fg"
        >
          {visible ? "Hide" : "Show"}
          <span className="sr-only"> password</span>
        </button>
      }
    />
  );
}
