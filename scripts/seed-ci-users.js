import dotenv from "dotenv";
dotenv.config();

if (!process.env.DATABASE_URL && process.env.DOCKER_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DOCKER_DATABASE_URL;
}

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("\n🌱 Seeding CI users...\n");

  // IDs must match JWT payloads
  const users = [
    { id: 1, email: "zap-student@ku.th",   user_name: "zap_student",   role: "Student" },
    { id: 2, email: "zap-professor@ku.th", user_name: "zap_professor", role: "Professor" },
    { id: 3, email: "zap-company@test.local", user_name: "zap_company", role: "Company" },
    { id: 4, email: "zap-admin@test.local", user_name: "zap_admin", role: "Admin" },
  ];

  for (const u of users) {
    const hashed = bcrypt.hashSync("123456", 10);

    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { role: u.role, verified: true, status: "Approved" },
      create: {
        id: u.id,
        email: u.email,
        user_name: u.user_name,
        password_hash: hashed,
        role: u.role,
        verified: true,
        status: "Approved",
      },
    });

    console.log(`✓ User created: ${user.email}`);

    // ---- ROLE PROFILES ----

    if (u.role === "Company") {
      await prisma.companyProfile.upsert({
        where: { user_id: user.id },
        update: {},
        create: {
          user_id: user.id,
          company_name: "CI Test Company",
          description: "Test company seeded for CI",
          industry: "Software",
          location: "Bangkok",
        },
      });

      console.log("  → Company profile created");
    }

    if (u.role === "Student") {
      const profile = await prisma.employeeProfile.upsert({
        where: { user_id: user.id },
        update: {},
        create: {
          user_id: user.id,
          summary: "Test student profile",
          skills: "JavaScript, Python",
        },
      });

      await prisma.resume.create({
        data: {
          employee_id: profile.id,
          file_url: "https://storage.example.com/resume.pdf",
          is_main: true,
        },
      });

      console.log("  → Student employee profile + resume created");
    }

    if (u.role === "Professor") {
      const profile = await prisma.professorProfile.upsert({
        where: { user_id: user.id },
        update: {},
        create: {
          user_id: user.id,
          department: "Computer Science",
          faculty: "Engineering",
          position: "Lecturer",
          summary: "CI test professor",
          link: "https://naist.jp",
        },
      });

      await prisma.degree.create({
        data: {
          professor_profile_id: profile.id,
          title: "PhD in Information Science",
          institution: "NAIST",
        },
      });

      console.log("  → Professor profile + degree created");
    }
  }

  console.log("\n✨ Done seeding CI users!\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
