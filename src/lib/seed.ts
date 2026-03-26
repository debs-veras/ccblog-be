import { PrismaClient, Role } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const pool = new PrismaPg({
  connectionString:
    "postgresql://blogdb_35p9_user:h1tqAHBaOWWKH3Rv61dkrVi1LyNY7U4Z@dpg-d724mb95pdvs738oker0-a/blogdb_35p9",
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
