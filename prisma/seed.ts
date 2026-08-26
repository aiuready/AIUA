import { PrismaClient, School, CourseStatus, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Dev/staging seed only. Seeds one ADMIN (per docs/DATABASE_SCHEMA.md §5),
// one INSTRUCTOR, and a handful of published courses with modules so every
// screen (catalog, dashboards, learning experience) has real data.
async function main() {
  const adminPassword = await bcrypt.hash("admin12345", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@aiua.africa" },
    update: {},
    create: {
      email: "admin@aiua.africa",
      passwordHash: adminPassword,
      name: "AIUA Admin",
      role: Role.ADMIN,
    },
  });

  const instructorPassword = await bcrypt.hash("instructor12345", 10);
  const instructor = await prisma.user.upsert({
    where: { email: "instructor@aiua.africa" },
    update: {},
    create: {
      email: "instructor@aiua.africa",
      passwordHash: instructorPassword,
      name: "Ada Chukwu",
      role: Role.INSTRUCTOR,
      bio: "AI product builder and educator across West Africa.",
    },
  });

  const studentPassword = await bcrypt.hash("student12345", 10);
  await prisma.user.upsert({
    where: { email: "student@aiua.africa" },
    update: { emailVerifiedAt: new Date() }, // ensure re-runs on an existing DB stay verified too
    create: {
      email: "student@aiua.africa",
      passwordHash: studentPassword,
      name: "Chidi Okafor",
      role: Role.STUDENT,
      emailVerifiedAt: new Date(), // pre-verified so seeded dev/test flows aren't blocked by the checkout gate
    },
  });

  const courses = [
    {
      slug: "ai-foundations",
      title: "AI Foundations for Everyone",
      description: "A no-code introduction to how modern AI systems work.",
      outcomes: "Explain how LLMs work; use AI tools confidently day to day.",
      school: School.FOUNDATIONS,
      priceKobo: 1500000, // NGN 15,000
    },
    {
      slug: "ai-for-business",
      title: "AI for Business Operations",
      description: "Apply AI to cut costs and speed up decisions in SMEs.",
      outcomes: "Automate reporting; build an AI-assisted ops workflow.",
      school: School.BUSINESS,
      priceKobo: 2500000, // NGN 25,000
    },
    {
      slug: "ai-content-creation",
      title: "AI-Powered Content Creation",
      description: "Produce video, copy, and design at scale with AI tools.",
      outcomes: "Ship a week of content in a day using an AI pipeline.",
      school: School.CONTENT,
      priceKobo: 2000000, // NGN 20,000
    },
  ];

  for (const c of courses) {
    const course = await prisma.course.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        ...c,
        status: CourseStatus.PUBLISHED,
        instructorId: instructor.id,
        modules: {
          create: [
            {
              title: "Module 1: Orientation",
              order: 1,
              videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            },
            {
              title: "Module 2: Core Concepts",
              order: 2,
              videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              quiz: {
                create: {
                  title: "Module 2 Check",
                  passMark: 70,
                  questions: {
                    create: [
                      {
                        type: "MCQ",
                        order: 1,
                        prompt: "What does AI stand for?",
                        options: {
                          create: [
                            { text: "Artificial Intelligence", isCorrect: true },
                            { text: "Automated Interface", isCorrect: false },
                            { text: "Applied Informatics", isCorrect: false },
                          ],
                        },
                      },
                    ],
                  },
                },
              },
            },
          ],
        },
      },
    });
    console.log(`Seeded course: ${course.title}`);
  }

  console.log(`Seeded admin: ${admin.email} / admin12345`);
  console.log(`Seeded instructor: ${instructor.email} / instructor12345`);
  console.log(`Seeded student: student@aiua.africa / student12345`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
