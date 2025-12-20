/**
 * Script to add admin user to InstantDB
 * Run: npx tsx scripts/add-admin-user.ts
 */

import { init, id } from "@instantdb/core";

// Load environment variables
const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
const ADMIN_TOKEN = process.env.NEXT_PUBLIC_INSTANT_ADMIN_KEY;

if (!APP_ID || !ADMIN_TOKEN) {
  console.error("❌ Missing environment variables!");
  console.error(
    "Make sure NEXT_PUBLIC_INSTANT_APP_ID and NEXT_PUBLIC_INSTANT_ADMIN_KEY are set"
  );
  process.exit(1);
}

// Initialize InstantDB with admin token
const db = init({
  appId: APP_ID,
  adminToken: ADMIN_TOKEN,
});

async function addAdminUser() {
  const adminEmail = "seanazu8@gmail.com";
  const userId = id();

  console.log("\n🔧 Adding admin user to InstantDB...\n");

  try {
    // Add admin user to database
    await db.transact([
      db.tx.users[userId].update({
        email: adminEmail,
        role: "admin",
        createdAt: Date.now(),
      }),
    ]);

    console.log("✅ Admin user added successfully!");
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`👑 Role: admin`);
    console.log(`🆔 User ID: ${userId}`);
    console.log("\n✨ You can now sign in with this email!\n");
  } catch (error) {
    console.error("❌ Failed to add admin user:", error);
    process.exit(1);
  }
}

addAdminUser();
