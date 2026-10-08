"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

// Puts the given query string on the current page without adding a history entry or scrolling.
export function useReplaceParams() {
  const router = useRouter();
  const pathname = usePathname();

  return useCallback(
    (params: URLSearchParams) => {
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );
}
