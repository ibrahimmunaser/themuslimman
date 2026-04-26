/**
 * Test Username Generation
 * 
 * Run this with: npx tsx lib/test-username-gen.ts
 */

import { generateUniqueUsername, previewUsername, validateFullName } from "./username-generator";

console.log("🧪 Testing Username Generation\n");

// Test cases
const testCases = [
  "Ibrahim Munaser",
  "John Smith",
  "Sarah Johnson",
  "Muhammad Ali",
  "A B",
  "OneNameOnly",
  "José García",
  "Mary-Jane Watson",
  "Dr. Ahmed Hassan",
  "Ibrahim Munaser", // Duplicate
  "Ibrahim Munaser", // Another duplicate
];

console.log("=".repeat(50));
console.log("PREVIEW MODE (no database check)\n");

testCases.forEach((name) => {
  const validation = validateFullName(name);
  if (!validation.valid) {
    console.log(`❌ ${name} → ${validation.error}`);
  } else {
    const preview = previewUsername(name);
    console.log(`✅ ${name.padEnd(25)} → ${preview}`);
  }
});

console.log("\n" + "=".repeat(50));
console.log("DATABASE MODE (with duplicate handling)\n");

async function testWithDatabase() {
  const results = [];
  
  for (const name of testCases) {
    try {
      const username = await generateUniqueUsername(name);
      results.push({ name, username, status: "✅" });
      console.log(`✅ ${name.padEnd(25)} → ${username}`);
    } catch (error) {
      results.push({ name, username: null, status: "❌", error });
      console.log(`❌ ${name.padEnd(25)} → ERROR: ${error}`);
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("SUMMARY\n");
  
  const grouped: Record<string, string[]> = {};
  results.forEach((r) => {
    if (!r.username) return;
    const base = r.username.replace(/\d+$/, "");
    if (!grouped[base]) grouped[base] = [];
    grouped[base].push(r.username);
  });

  Object.entries(grouped).forEach(([base, usernames]) => {
    if (usernames.length > 1) {
      console.log(`${base}: ${usernames.join(", ")} (${usernames.length} users)`);
    }
  });

  console.log("\n✨ Test complete!\n");
}

testWithDatabase().catch(console.error);
