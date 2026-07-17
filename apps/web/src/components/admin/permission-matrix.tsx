"use client";

import { useTransition } from "react";

import { setRolePermission } from "@/app/(protected)/admin/roles/actions";

type Role = { id: string; name: string };
type Permission = { id: string; key: string; roleIds: string[] };

export function PermissionMatrix({ permissions, roles }: { permissions: Permission[]; roles: Role[] }) {
  const [isPending, startTransition] = useTransition();

  return <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500"><tr><th className="pb-3 font-medium">Permission</th>{roles.map((role) => <th className="px-3 pb-3 text-center font-medium" key={role.id}>{role.name.replaceAll("_", " ")}</th>)}</tr></thead><tbody className="divide-y divide-white/10">{permissions.map((permission) => <tr key={permission.id}><td className="py-3"><p className="font-mono text-xs text-slate-200">{permission.key}</p></td>{roles.map((role) => { const enabled = permission.roleIds.includes(role.id); return <td className="px-3 py-3 text-center" key={role.id}><input aria-label={`Toggle ${permission.key} for ${role.name}`} checked={enabled} className="size-4 accent-sky-300" disabled={isPending} onChange={(event) => startTransition(() => setRolePermission({ roleId: role.id, permissionId: permission.id, enabled: event.target.checked }))} type="checkbox" /></td>; })}</tr>)}</tbody></table></div>;
}
