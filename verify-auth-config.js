#!/usr/bin/env node

/**
 * Verification script for OAuth configuration
 * Run: node verify-auth-config.js
 */

const fs = require("fs");
const path = require("path");

// Read .env.local file
const envPath = path.join(__dirname, ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");

// Parse environment variables
const envVars = {};
envContent.split("\n").forEach((line) => {
  const match = line.match(/^([^#][^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    envVars[key] = value;
  }
});

console.log("\n🔍 Verifying OAuth Configuration...\n");

const required = {
  NEXTAUTH_URL: envVars.NEXTAUTH_URL,
  NEXTAUTH_SECRET: envVars.NEXTAUTH_SECRET,
  GOOGLE_CLIENT_ID: envVars.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: envVars.GOOGLE_CLIENT_SECRET,
};

let allGood = true;

console.log("📋 Environment Variables Check:\n");

for (const [key, value] of Object.entries(required)) {
  if (!value || value === "placeholder") {
    console.log(`❌ ${key}: MISSING or set to 'placeholder'`);
    allGood = false;
  } else if (key === "NEXTAUTH_SECRET" || key === "GOOGLE_CLIENT_SECRET") {
    // Don't show full secret, just confirm it exists
    console.log(`✅ ${key}: Set (${value.substring(0, 10)}...)`);
  } else {
    console.log(`✅ ${key}: ${value}`);
  }
}

const nextauthUrl = envVars.NEXTAUTH_URL || "http://localhost:3000";

console.log("\n📍 Required Redirect URI Configuration:\n");
console.log("In Google Cloud Console, you MUST have this EXACT redirect URI:");
console.log(`   ${nextauthUrl}/api/auth/callback/google`);
console.log("\n⚠️  Common mistakes:");
console.log("   - Extra spaces in the URI");
console.log("   - Trailing slash (should NOT have one)");
console.log("   - Wrong protocol (http vs https)");
console.log("   - Wrong port number");

console.log("\n🌐 Authorized JavaScript Origins:\n");
console.log(
  "In Google Cloud Console, add this to Authorized JavaScript origins:"
);
console.log(`   ${nextauthUrl}`);

if (allGood) {
  console.log("\n✅ All environment variables are configured!");
  console.log("\n📝 Next steps:");
  console.log("1. Go to: https://console.cloud.google.com/apis/credentials");
  console.log("2. Click on your OAuth 2.0 Client ID");
  console.log("3. Verify the Authorized redirect URIs matches exactly:");
  console.log(`   ${nextauthUrl}/api/auth/callback/google`);
  console.log("4. Click SAVE");
  console.log("5. Restart your Next.js dev server");
  console.log("6. Clear browser cache/cookies for localhost:3000");
  console.log("7. Try signing in again");
} else {
  console.log(
    "\n❌ Please fix the missing environment variables in .env.local"
  );
}

console.log("\n");
