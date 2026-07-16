import { prisma } from "../src/lib/prisma";
import { RoleName } from "../src/generated/prisma/client";

const roles: Array<{ name: RoleName; description: string }> = [
  { name: RoleName.SUPER_ADMIN, description: "Full platform access." },
  { name: RoleName.ADMIN, description: "Platform administration access." },
  { name: RoleName.EDITOR, description: "Content editing access." },
  { name: RoleName.AUTHOR, description: "Content authoring access." },
  { name: RoleName.STUDENT, description: "Learning access." },
  { name: RoleName.CUSTOMER, description: "Purchased-product access." },
];

async function main() {
  await prisma.$transaction(
    roles.map(({ name, description }) =>
      prisma.role.upsert({
        where: { name },
        create: { name, description },
        update: { description },
      }),
    ),
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    await prisma.$disconnect();
    throw error;
  });
