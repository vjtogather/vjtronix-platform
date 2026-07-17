"use server";

import { revalidatePath } from "next/cache";

import { RoleName } from "@/generated/prisma/client";
import { requireRole } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { createRoleSchema, roleIdSchema, rolePermissionSchema, updateRoleSchema } from "@/lib/validations/admin-role";

const protectedRoles = new Set<RoleName>([RoleName.SUPER_ADMIN, RoleName.ADMIN]);

async function requireSuperAdmin() {
  const session = await requireRole([RoleName.SUPER_ADMIN]);
  return session.user.id;
}

function revalidateRolePaths(roleId?: string) {
  revalidatePath("/admin/roles");
  revalidatePath("/admin/permissions");
  if (roleId) revalidatePath(`/admin/roles/${roleId}`);
}

export async function createRole(formData: FormData) {
  const parsed = createRoleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const actorId = await requireSuperAdmin();

  const role = await prisma.role.create({ data: parsed.data, select: { id: true, name: true } }).catch((error: unknown) => {
    if (isUniqueConstraint(error)) return null;
    throw error;
  });
  if (!role) return;
  await prisma.auditLog.create({ data: { actorId, event: "ADMIN_ROLE_CREATED", metadata: { roleId: role.id, role: role.name } } });
  revalidateRolePaths(role.id);
}

export async function updateRole(formData: FormData) {
  const parsed = updateRoleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const actorId = await requireSuperAdmin();
  const role = await prisma.role.update({ where: { id: parsed.data.id }, data: { description: parsed.data.description }, select: { id: true, name: true } });
  await prisma.auditLog.create({ data: { actorId, event: "ADMIN_ROLE_UPDATED", metadata: { roleId: role.id, role: role.name } } });
  revalidateRolePaths(role.id);
}

export async function deleteRole(formData: FormData) {
  const parsed = roleIdSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const actorId = await requireSuperAdmin();
  const role = await prisma.role.findUniqueOrThrow({ where: { id: parsed.data.id }, select: { id: true, name: true } });
  if (protectedRoles.has(role.name)) throw new Error("This system role cannot be deleted.");

  await prisma.$transaction([
    prisma.role.delete({ where: { id: role.id } }),
    prisma.auditLog.create({ data: { actorId, event: "ADMIN_ROLE_DELETED", metadata: { roleId: role.id, role: role.name } } }),
  ]);
  revalidateRolePaths(role.id);
}

export async function setRolePermission(input: unknown) {
  const parsed = rolePermissionSchema.safeParse(input);
  if (!parsed.success) return;
  const actorId = await requireSuperAdmin();
  const role = await prisma.role.findUniqueOrThrow({ where: { id: parsed.data.roleId }, select: { id: true, name: true } });
  const permission = await prisma.permission.findUniqueOrThrow({ where: { id: parsed.data.permissionId }, select: { id: true, key: true } });

  if (parsed.data.enabled) {
    await prisma.$transaction([
      prisma.rolePermission.upsert({ where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } }, create: { roleId: role.id, permissionId: permission.id }, update: {} }),
      prisma.auditLog.create({ data: { actorId, event: "ADMIN_ROLE_PERMISSION_GRANTED", metadata: { roleId: role.id, role: role.name, permissionId: permission.id, permission: permission.key } } }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.rolePermission.deleteMany({ where: { roleId: role.id, permissionId: permission.id } }),
      prisma.auditLog.create({ data: { actorId, event: "ADMIN_ROLE_PERMISSION_REVOKED", metadata: { roleId: role.id, role: role.name, permissionId: permission.id, permission: permission.key } } }),
    ]);
  }
  revalidateRolePaths(role.id);
}

function isUniqueConstraint(error: unknown): error is { code: string } { return typeof error === "object" && error !== null && "code" in error && error.code === "P2002"; }
