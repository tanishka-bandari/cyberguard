"use client";

import Logout from "@mui/icons-material/Logout";
import Menu from "@mui/icons-material/Menu";
import { GlobalSearch } from "@/components/layout/GlobalSearch";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useSession } from "@/hooks/useSession";
import { ROLE_LABEL } from "@/lib/domain/user";

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { user, signOut } = useSession();

  const handleSignOut = () => {
    signOut();
    // A full navigation: the guard would otherwise redirect first and tack ?next=<this page> onto /login.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full reload on purpose
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-panel px-3 sm:gap-3 sm:px-4">
      <button
        type="button"
        aria-label="Open menu"
        onClick={onOpenMenu}
        className="grid size-9 shrink-0 place-items-center rounded-md text-xl text-muted hover:bg-hover hover:text-fg lg:hidden"
      >
        <Menu fontSize="inherit" />
      </button>
      <GlobalSearch />
      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <ThemeToggle />
        {user && (
          <div className="flex items-center gap-2">
            <Avatar name={user.name} />
            <div className="hidden text-left text-xs leading-tight md:block">
              <p className="font-medium">{user.name}</p>
              <Badge tone="accent" className="mt-0.5">
                {ROLE_LABEL[user.role]}
              </Badge>
            </div>
          </div>
        )}
        <button
          type="button"
          aria-label="Sign out"
          onClick={handleSignOut}
          className="grid size-9 place-items-center rounded-md text-xl text-muted hover:bg-hover hover:text-fg"
        >
          <Logout fontSize="inherit" />
        </button>
      </div>
    </header>
  );
}
