"use client";

import { useCallback, useMemo, useState } from "react";
import { useSWRConfig } from "swr";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { controlClass } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { STAFF_KEY } from "@/hooks/useStaff";
import { useSession } from "@/hooks/useSession";
import { USERS_KEY, useUsers } from "@/hooks/useUsers";
import { changeRole } from "@/lib/api/users";
import { can } from "@/lib/auth/permissions";
import { cn } from "@/lib/cn";
import { toast } from "@/lib/toast";
import type { Role, User } from "@/types/domain";

const ROLES: readonly Role[] = ["USER", "ANALYST", "ADMIN"];
const ROLE_LABEL: Record<Role, string> = { USER: "Reporter", ANALYST: "Analyst", ADMIN: "Admin" };
const ROLE_TONE: Record<Role, BadgeTone> = { USER: "neutral", ANALYST: "info", ADMIN: "accent" };

interface RoleChange {
  user: User;
  role: Role;
}

export function UsersTable() {
  const { user: me } = useSession();
  const { data: users, error, mutate } = useUsers();
  const { mutate: refresh } = useSWRConfig();
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [confirming, setConfirming] = useState<RoleChange | null>(null);

  const apply = useCallback(
    async ({ user, role }: RoleChange) => {
      setConfirming(null);
      setSavingId(user.id);
      try {
        await changeRole(user.id, role);
        toast.success(`${user.name} is now ${ROLE_LABEL[role].toLowerCase()}`);
        await Promise.all([refresh(USERS_KEY), refresh(STAFF_KEY)]);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : `Could not change the role of ${user.name}`);
      } finally {
        setSavingId(null);
      }
    },
    [refresh],
  );

  // Promoting to admin grants full control, so it asks first.
  const requestChange = useCallback(
    (change: RoleChange) => (change.role === "ADMIN" ? setConfirming(change) : void apply(change)),
    [apply],
  );

  const columns = useMemo<Column<User>[]>(
    () => [
      { key: "name", header: "Name", sortValue: (u) => u.name.toLowerCase(), cell: (u) => <span className="font-medium">{u.name}</span> },
      { key: "email", header: "Email", sortValue: (u) => u.email.toLowerCase(), cell: (u) => u.email },
      {
        key: "role",
        header: "Role",
        sortValue: (u) => ROLES.indexOf(u.role),
        cell: (u) => <Badge tone={ROLE_TONE[u.role]}>{ROLE_LABEL[u.role]}</Badge>,
      },
      {
        key: "change",
        header: "Change role",
        cell: (u) => {
          const isSelf = u.id === me?.id;
          return (
            <div>
              <select
                aria-label={`Role for ${u.name}`}
                aria-describedby={isSelf ? `self-role-${u.id}` : undefined}
                value={u.role}
                disabled={isSelf || savingId === u.id}
                onChange={(e) => requestChange({ user: u, role: e.target.value as Role })}
                className={cn(controlClass, "h-9 w-36")}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </option>
                ))}
              </select>
              {isSelf && (
                <p id={`self-role-${u.id}`} className="mt-1 text-xs text-muted">
                  You cannot change your own role.
                </p>
              )}
            </div>
          );
        },
      },
    ],
    [me?.id, savingId, requestChange],
  );

  if (!can(me, "users:manage")) return null;
  if (error) return <ErrorState error={error} onRetry={() => void mutate()} />;
  if (!users) {
    return (
      <Card>
        <div className="space-y-3" aria-busy="true" aria-label="Loading users">
          {[0, 1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-10" />
          ))}
        </div>
      </Card>
    );
  }

  const needle = query.trim().toLowerCase();
  const rows = needle
    ? users.filter((u) => u.name.toLowerCase().includes(needle) || u.email.toLowerCase().includes(needle))
    : users;

  return (
    <div className="space-y-4">
      <div className="max-w-sm">
        <Input
          label="Search users"
          type="search"
          placeholder="Name or email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <Card flush>
        <DataTable
          caption="User accounts"
          columns={columns}
          rows={rows}
          rowKey={(u) => u.id}
          initialSort={{ key: "name", dir: "asc" }}
          empty={
            <EmptyState
              title={needle ? "No users match your search" : "No users yet"}
              description={needle ? "Try a different name or email." : undefined}
            />
          }
        />
      </Card>

      <Dialog
        open={!!confirming}
        onClose={() => setConfirming(null)}
        title="Make this user an admin?"
        footer={
          <>
            <Button onClick={() => setConfirming(null)}>Cancel</Button>
            <Button variant="primary" onClick={() => confirming && void apply(confirming)}>
              Make admin
            </Button>
          </>
        }
      >
        <p className="text-sm">
          {confirming?.user.name} will be able to manage users, assign and delete incidents, and change every
          role.
        </p>
      </Dialog>
    </div>
  );
}
