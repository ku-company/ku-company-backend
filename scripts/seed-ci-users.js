import dotenv from "dotenv";
dotenv.config();

// If your DB URL only exists under DOCKER_DATABASE_URL, map it:
if (!process.env.DATABASE_URL && process.env.DOCKER_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DOCKER_DATABASE_URL;
}

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const users = [
    {
      email: "zap-student@ku.th",
      user_name: "zap_student",
      password: "123456",
      role: "Student",
      verified: true,
      status: "Approved",
    },
    {
      email: "zap-company@test.local",
      user_name: "zap_company",
      password: "123456",
      role: "Company",
      verified: true,
      status: "Approved",
    },
    {
      email: "zap-professor@ku.th",
      user_name: "zap_professor",
      password: "123456",
      role: "Professor",
      verified: true,
      status: "Approved",
    },
    {
      email: "zap-admin@test.local",
      user_name: "zap_admin",
      password: "123456",
      role: "Admin",
      verified: true,
      status: "Approved",
    },
  ];

  for (const u of users) {
    const hashed = bcrypt.hashSync(u.password, 10);

    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        role: u.role,
        verified: u.verified,
        status: u.status,
      },
      create: {
        email: u.email,
        user_name: u.user_name,
        password_hash: hashed,
        role: u.role,
        verified: u.verified,
        status: u.status,
      },
    });
  }

  console.log("\n✨ CI users seeded successfully!\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
