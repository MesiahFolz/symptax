const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "master@symptax.com";
  const adminPassword = "SympTaxMaster2024!";
  
  const existing = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (existing) {
    console.log("Master Admin already exists.");
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.create({
    data: {
      name: "Master Administrator",
      email: adminEmail,
      password: hashedPassword,
      role: "MASTER_ADMIN",
      publicId: "ST-ROOT",
      isVerified: true,
      profile: {
        create: {
          bloodType: "UNIVERSAL",
          gender: "ADMIN",
        }
      }
    }
  });

  console.log("-----------------------------------------");
  console.log("MASTER ADMIN ACCOUNT CREATED SUCCESSFULLY");
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
