/**
 * Test Email Sending with Real Signup
 * 
 * Run with: npx tsx lib/test-email.ts
 */

import { generateUniqueUsername } from "./username-generator";
import { prisma } from "./db";
import bcrypt from "bcryptjs";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

console.log("🧪 Testing Email Sending\n");
console.log("=".repeat(60));

async function testEmailFlow() {
  console.log("\n📧 Testing Signup Email Flow\n");

  // Generate test user data
  const testEmail = "themuslimman77@gmail.com"; // Your verified email
  const testFullName = "Test Student";
  const testPassword = "testpass123";
  
  console.log(`📝 Creating test account:`);
  console.log(`   Name: ${testFullName}`);
  console.log(`   Email: ${testEmail}`);

  try {
    // Generate username
    const username = await generateUniqueUsername(testFullName);
    console.log(`✅ Username generated: ${username}`);

    // Hash password
    const passwordHash = await bcrypt.hash(testPassword, 12);
    console.log(`✅ Password hashed`);

    // Create user
    const user = await prisma.user.create({
      data: {
        fullName: testFullName,
        email: testEmail,
        username,
        passwordHash,
        role: "student",
        emailVerified: false,
        verificationToken: `test-token-${Date.now()}`,
      },
    });
    console.log(`✅ User created in database (ID: ${user.id})`);

    // Create student profile
    await prisma.studentProfile.create({
      data: {
        userId: user.id,
      },
    });
    console.log(`✅ Student profile created`);

    // Send verification email
    console.log(`\n📧 Sending verification email...`);
    
    const verificationUrl = `http://localhost:3000/verify-email?token=${user.verificationToken}`;
    
    const { data, error } = await resend.emails.send({
      from: "Seerah LMS <onboarding@resend.dev>",
      to: [testEmail],
      subject: "Verify your email - Seerah LMS",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #d4af37;">Welcome to Seerah LMS!</h1>
          
          <p>Thank you for creating an account. Your username is:</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 24px; font-weight: bold; color: #d4af37; margin: 0; font-family: monospace;">
              ${username}
            </p>
          </div>
          
          <p><strong>Important:</strong> Save your username - you'll need it to sign in (not your email).</p>
          
          <p>Click the button below to verify your email and activate your account:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: #d4af37; color: #1a1a1a; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Verify Email
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #d4af37;">${verificationUrl}</a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px;">
            © 2026 TheMuslimMan · Seerah LMS<br>
            <a href="http://themuslimman.com" style="color: #d4af37;">themuslimman.com</a>
          </p>
        </div>
      `,
    });

    if (error) {
      console.log(`❌ Email send failed:`, error);
    } else {
      console.log(`✅ Email sent successfully!`);
      console.log(`   Email ID: ${data?.id}`);
    }

    // Cleanup
    console.log(`\n🧹 Cleaning up test account...`);
    await prisma.studentProfile.delete({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
    console.log(`✅ Test account deleted`);

    console.log("\n" + "=".repeat(60));
    console.log("✨ Email test complete!\n");
    console.log(`📧 Check ${testEmail} for the verification email`);
    console.log(`🔑 Username: ${username}`);
    console.log(`🔗 Verification link: ${verificationUrl}\n`);

  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Check if API key is set
if (!process.env.RESEND_API_KEY) {
  console.log("❌ RESEND_API_KEY not set in .env");
  process.exit(1);
}

console.log(`✅ RESEND_API_KEY found: ${process.env.RESEND_API_KEY.substring(0, 10)}...`);

testEmailFlow().catch((error) => {
  console.error("💥 Test failed:", error);
  process.exit(1);
});
