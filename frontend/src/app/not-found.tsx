import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="grid min-h-dvh place-items-center p-4 text-center outline-none">
      <div>
        <p className="font-mono text-sm text-muted">404</p>
        <h1 className="mt-1 text-2xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-muted">This page does not exist or has moved.</p>
        <Link href="/" className={`${buttonClass("primary")} mt-6`}>
          Go to your home page
        </Link>
      </div>
    </main>
  );
}
