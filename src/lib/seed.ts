import { PrismaClient, Role } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const pool = new PrismaPg({
  connectionString:
    "postgresql://blogcc:blogpassword@localhost:5432/blogdbcc",
});
const prisma = new PrismaClient({ adapter: pool });

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@blogtech.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@blogtech.com",
      password: passwordHash,
      role: Role.ADMIN,
    },
  });

  console.log("✅ Seed executado com sucesso");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
