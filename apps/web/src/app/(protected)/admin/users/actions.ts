"use server";

import { revalidatePath } from "next/cache";

import { Prisma, RoleName } from "@/generated/prisma/client";
import { requireRole } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { adminUserRoleSchema, adminUserStatusSchema, adminUserUpdateSchema } from "@/lib/validations/admin-user";

async function getAuthorizedTarget(userId: string) {
  const session = await requireRole([RoleName.ADMIN, RoleName.SUPER_ADMIN]);
  const target = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { roles: { select: { role: { select: { name: true } } } } },
  });
  const isSuperAdmin = session.user.roles.includes(RoleName.SUPER_ADMIN);
  const targetIsSuperAdmin = target.roles.some(({ role }) => role.name === RoleName.SUPER_ADMIN);

  if (targetIsSuperAdmin && !isSuperAdmin) {
    throw new Error("Only a super administrator can edit a super administrator account.");
  }

  return { actorId: session.user.id, isSuperAdmin };
}

function revalidateUser(userId: string) {
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
}

export async function updateUser(formData: FormData) {
  const parsed = adminUserUpdateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  const { actorId } = await getAuthorizedTarget(parsed.data.id);

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: parsed.data.id },
        data: { name: parsed.data.name, phone: parsed.data.phone, isActive: parsed.data.isActive },
      }),
      prisma.auditLog.create({ data: { actorId, event: "ADMIN_USER_UPDATED", metadata: { userId: parsed.data.id } } }),
    ]);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return;
    throw error;
  }

  revalidateUser(parsed.data.id);
}

export async function setUserStatus(formData: FormData) {
  const parsed = adminUserStatusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  const { actorId } = await getAuthorizedTarget(parsed.data.id);
  await prisma.$transaction([
    prisma.user.update({ where: { id: parsed.data.id }, data: { isActive: parsed.data.isActive } }),
    prisma.auditLog.create({ data: { actorId, event: parsed.data.isActive ? "ADMIN_USER_ENABLED" : "ADMIN_USER_DISABLED", metadata: { userId: parsed.data.id } } }),
  ]);
  revalidateUser(parsed.data.id);
}

export async function assignUserRole(formData: FormData) {
  const parsed = adminUserRoleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  const [{ actorId, isSuperAdmin }, role] = await Promise.all([
    getAuthorizedTarget(parsed.data.userId),
    prisma.role.findUniqueOrThrow({ where: { id: parsed.data.roleId }, select: { id: true, name: true } }),
  ]);
  if (role.name === RoleName.SUPER_ADMIN && !isSuperAdmin) {
    throw new Error("Only a super administrator can assign the super administrator role.");
  }

  await prisma.$transaction([
    prisma.userRole.upsert({
      where: { userId_roleId: { userId: parsed.data.userId, roleId: role.id } },
      create: { userId: parsed.data.userId, roleId: role.id, assignedBy: actorId },
      update: {},
    }),
    prisma.auditLog.create({ data: { actorId, event: "ADMIN_USER_ROLE_ASSIGNED", metadata: { userId: parsed.data.userId, role: role.name } } }),
  ]);
  revalidateUser(parsed.data.userId);
}

export async function removeUserRole(formData: FormData) {
  const parsed = adminUserRoleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  const [{ actorId, isSuperAdmin }, role] = await Promise.all([
    getAuthorizedTarget(parsed.data.userId),
    prisma.role.findUniqueOrThrow({ where: { id: parsed.data.roleId }, select: { id: true, name: true } }),
  ]);
  if (role.name === RoleName.SUPER_ADMIN && !isSuperAdmin) {
    throw new Error("Only a super administrator can remove the super administrator role.");
  }
  if (role.name === RoleName.SUPER_ADMIN) {
    const superAdminAssignments = await prisma.userRole.count({ where: { roleId: role.id } });
    if (superAdminAssignments <= 1) {
      throw new Error("The final super administrator role assignment cannot be removed.");
    }
  }

  await prisma.$transaction([
    prisma.userRole.deleteMany({ where: { userId: parsed.data.userId, roleId: role.id } }),
    prisma.auditLog.create({ data: { actorId, event: "ADMIN_USER_ROLE_REMOVED", metadata: { userId: parsed.data.userId, role: role.name } } }),
  ]);
  revalidateUser(parsed.data.userId);
}
