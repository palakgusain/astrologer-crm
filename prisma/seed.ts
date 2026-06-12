import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.consultation.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);
  await prisma.user.create({
    data: {
      email: "astrologer@crm.com",
      name: "Demo Astrologer",
      passwordHash,
    },
  });

  const clients = await Promise.all([
    prisma.client.create({
      data: {
        name: "Priya Sharma",
        phone: "+91 98765 43210",
        email: "priya.sharma@email.com",
        birthDate: new Date("1992-03-15"),
        birthTime: "06:30",
        birthPlace: "Mumbai, Maharashtra",
        tags: "vip, repeat-client",
        notes: "Prefers Vedic astrology readings. Interested in career guidance.",
      },
    }),
    prisma.client.create({
      data: {
        name: "Rahul Mehta",
        phone: "+91 87654 32109",
        email: "rahul.mehta@email.com",
        birthDate: new Date("1988-11-22"),
        birthTime: "14:15",
        birthPlace: "Delhi, India",
        tags: "marriage, new-client",
        notes: "First consultation for marriage compatibility.",
      },
    }),
    prisma.client.create({
      data: {
        name: "Ananya Patel",
        phone: "+91 76543 21098",
        email: "ananya.p@email.com",
        birthDate: new Date("1995-07-08"),
        birthTime: "22:45",
        birthPlace: "Ahmedabad, Gujarat",
        tags: "gemstone",
        notes: "Looking for gemstone recommendations for health issues.",
      },
    }),
    prisma.client.create({
      data: {
        name: "Vikram Singh",
        phone: "+91 65432 10987",
        birthDate: new Date("1980-01-30"),
        birthTime: "09:00",
        birthPlace: "Jaipur, Rajasthan",
        tags: "business, repeat-client",
        notes: "Business owner seeking muhurat for new venture.",
      },
    }),
  ]);

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 5);
  nextWeek.setHours(15, 30, 0, 0);

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(11, 0, 0, 0);

  await Promise.all([
    prisma.consultation.create({
      data: {
        clientId: clients[0].id,
        scheduledAt: tomorrow,
        duration: 60,
        type: "career",
        status: "scheduled",
        fee: 2500,
        paymentStatus: "pending",
      },
    }),
    prisma.consultation.create({
      data: {
        clientId: clients[1].id,
        scheduledAt: nextWeek,
        duration: 90,
        type: "marriage",
        status: "scheduled",
        fee: 3500,
        paymentStatus: "pending",
      },
    }),
    prisma.consultation.create({
      data: {
        clientId: clients[2].id,
        scheduledAt: yesterday,
        duration: 45,
        type: "gemstone",
        status: "completed",
        sessionNotes:
          "Recommended Blue Sapphire (Neelam) after analyzing Saturn placement. Advised to wear on middle finger of right hand on Saturday morning.",
        fee: 1500,
        paymentStatus: "paid",
        paymentMethod: "upi",
        paidAt: yesterday,
      },
    }),
    prisma.consultation.create({
      data: {
        clientId: clients[0].id,
        scheduledAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 0),
        duration: 60,
        type: "general",
        status: "scheduled",
        fee: 2000,
        paymentStatus: "partial",
        paymentMethod: "cash",
        paymentNotes: "₹1000 advance received",
      },
    }),
    prisma.consultation.create({
      data: {
        clientId: clients[3].id,
        scheduledAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3, 10, 0),
        duration: 60,
        type: "general",
        status: "completed",
        sessionNotes:
          "Discussed favorable muhurat for business launch. Suggested dates in the next lunar fortnight.",
        fee: 2000,
        paymentStatus: "paid",
        paymentMethod: "bank_transfer",
        paidAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3, 11, 0),
      },
    }),
  ]);

  console.log("Seed data created successfully.");
  console.log("Login: astrologer@crm.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
