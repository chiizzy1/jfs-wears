/**
 * Production Admin Creation Script
 *
 * This script safely creates an admin account without affecting existing data.
 * Use this for initial production setup or to create additional admins.
 *
 * Usage:
 *   npm run create-admin
 *
 * Environment Variables (optional):
 *   ADMIN_EMAIL - Admin email address (default: reads from prompt)
 *   ADMIN_PASSWORD - Admin password (default: reads from prompt)
 *   ADMIN_NAME - Admin name (default: "Super Admin")
 */

import { PrismaClient, StaffRole } from "@prisma/client";
import * as bcrypt from "bcrypt";
import * as readline from "readline";

const prisma = new PrismaClient();

function prompt(question: string, hidden = false): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    if (hidden) {
      // For password input, we can't truly hide in Node.js without external packages
      // But we indicate it's a password
      process.stdout.write(question);
      rl.question("", (answer) => {
        rl.close();
        resolve(answer);
      });
    } else {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
      });
    }
  });
}

async function createAdmin() {
  console.log("\n🔐 JFS Wears - Production Admin Creation\n");
  console.log("=".repeat(50));

  // Get credentials from environment or prompt
  let email = process.env.ADMIN_EMAIL;
  let password = process.env.ADMIN_PASSWORD;
  let name = process.env.ADMIN_NAME || "Super Admin";

  if (!email) {
    email = await prompt("Enter admin email: ");
  }

  if (!password) {
    password = await prompt("Enter admin password (min 8 chars): ");
  }

  if (!process.env.ADMIN_NAME) {
    const inputName = await prompt("Enter admin name (press Enter for 'Super Admin'): ");
    if (inputName.trim()) {
      name = inputName.trim();
    }
  }

  // Validate input
  if (!email || !email.includes("@")) {
    console.error("❌ Invalid email address");
    process.exit(1);
  }

  if (!password || password.length < 8) {
    console.error("❌ Password must be at least 8 characters");
    process.exit(1);
  }

  // Check if admin already exists
  const existingAdmin = await prisma.staff.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.error(`\n❌ A staff member with email "${email}" already exists.`);
    console.log("   Use a different email or update the existing account via the admin panel.");
    process.exit(1);
  }

  // Create the admin
  console.log("\n🔄 Creating admin account...\n");

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.staff.create({
    data: {
      email,
      name,
      passwordHash,
      role: StaffRole.ADMIN,
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  console.log("=".repeat(50));
  console.log("✅ Admin account created successfully!\n");
  console.log("   ID:       ", admin.id);
  console.log("   Email:    ", admin.email);
  console.log("   Name:     ", admin.name);
  console.log("   Role:     ", admin.role);
  console.log("   Created:  ", admin.createdAt.toISOString());
  console.log("\n=".repeat(50));
  console.log("\n🔒 Security Reminders:");
  console.log("   - Change the password after first login");
  console.log("   - Enable 2FA if available");
  console.log("   - Keep these credentials secure");
  console.log("\n");
}

// For non-interactive usage (CI/CD, scripts)
async function createAdminNonInteractive() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Super Admin";

  if (!email || !password) {
    console.error("❌ ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required");
    console.log("\nUsage:");
    console.log("  ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=SecurePass123! npm run create-admin");
    process.exit(1);
  }

  // Check if admin already exists
  const existingAdmin = await prisma.staff.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log(`⚠️ Admin with email "${email}" already exists. Skipping creation.`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.staff.create({
    data: {
      email,
      name,
      passwordHash,
      role: StaffRole.ADMIN,
      isActive: true,
    },
  });

  console.log(`✅ Admin created: ${admin.email}`);
}

// Main execution
const isInteractive = process.stdin.isTTY;

if (isInteractive) {
  createAdmin()
    .catch((e) => {
      console.error("❌ Error:", e.message);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
} else {
  // Non-interactive mode (for CI/CD, Docker, etc.)
  createAdminNonInteractive()
    .catch((e) => {
      console.error("❌ Error:", e.message);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
