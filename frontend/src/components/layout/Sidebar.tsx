import Link from "next/link";
import { BrandMark } from "@/components/layout/BrandMark";
import { NavList } from "@/components/layout/NavList";

// Desktop sidebar (lg and up). Below lg the same NavList appears in MobileNav.
export function Sidebar() {
  return (
    <div className="flex h-full flex-col border-r border-border bg-panel">
      <div className="flex h-14 items-center border-b border-border px-5">
        <Link href="/" aria-label="CyberGuard home">
          <BrandMark />
        </Link>
      </div>
      <NavList />
    </div>
  );
}
