import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { customAlphabet } from "nanoid";
import { prisma } from "@/lib/db";
import { generateUniqueUsername, validateFullName } from "@/lib/username-generator";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const generateToken = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 32);

const SignupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

/**
 * POST /api/auth/signup-student
 * 
 * Creates a new student account with auto-generated username
 * Sends verification email with welcome message
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = SignupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { fullName, email, password } = parsed.data;

    // Validate name
    const nameValidation = validateFullName(fullName);
    if (!nameValidation.valid) {
      return NextResponse.json(
        { error: nameValidation.error },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Generate unique username
    const username = await generateUniqueUsername(fullName);

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = generateToken();

    // Create user and student profile in transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          fullName: fullName.trim(),
          email: email.toLowerCase(),
          username,
          passwordHash,
          role: "student",
          emailVerified: false,
          verificationToken,
          student: {
            create: {
              isActive: true,
            },
          },
        },
        include: {
          student: true,
        },
      });

      return newUser;
    });

    // Send verification email
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`;

    try {
      await resend.emails.send({
        from: "Seerah LMS <onboarding@resend.dev>",
        to: email,
        subject: "Welcome to Seerah LMS - Verify your email",
        html: generateWelcomeEmail({
          fullName: fullName.trim(),
          username,
          verificationUrl,
        }),
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail signup if email fails - user is created
    }

    return NextResponse.json({
      success: true,
      username,
      message: "Account created successfully. Please check your email to verify.",
    });

  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * Generate welcome email HTML
 */
function generateWelcomeEmail(data: {
  fullName: string;
  username: string;
  verificationUrl: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Seerah LMS</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: #f4c542; margin: 0; font-size: 28px;">Welcome to Seerah LMS</h1>
          <p style="color: #e5e5e5; margin: 10px 0 0 0; font-size: 16px;">Start your journey through the life of the Prophet ﷺ</p>
        </div>

        <div style="background: #ffffff; padding: 40px 30px; border-left: 1px solid #e5e5e5; border-right: 1px solid #e5e5e5;">
          <p style="font-size: 16px; margin: 0 0 20px 0;">As-salamu alaykum ${data.fullName},</p>
          
          <p style="font-size: 16px; margin: 0 0 20px 0;">
            Your account has been created successfully! Before you can start learning, please verify your email address.
          </p>

          <div style="background: #f8f9fa; border-left: 4px solid #f4c542; padding: 20px; margin: 30px 0; border-radius: 4px;">
            <p style="margin: 0 0 10px 0; font-weight: 600; color: #666; font-size: 14px;">YOUR LOGIN USERNAME</p>
            <p style="margin: 0; font-size: 24px; font-family: 'Courier New', monospace; color: #f4c542; font-weight: bold;">${data.username}</p>
            <p style="margin: 10px 0 0 0; font-size: 13px; color: #666;">
              <strong>Important:</strong> Use this username (not your email) to sign in.
            </p>
          </div>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${data.verificationUrl}" style="display: inline-block; background: #f4c542; color: #1a1a1a; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Verify Email Address
            </a>
          </div>

          <p style="font-size: 14px; color: #666; margin: 30px 0 0 0;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="font-size: 12px; color: #999; word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: 'Courier New', monospace;">
            ${data.verificationUrl}
          </p>
        </div>

        <div style="background: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e5e5e5; border-top: none;">
          <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;">
            Ready to start learning? Complete the full Seerah from beginning to end.
          </p>
          <p style="font-size: 13px; color: #999; margin: 0;">
            © ${new Date().getFullYear()} Seerah LMS · TheMuslimMan
          </p>
        </div>

        <p style="font-size: 12px; color: #999; text-align: center; margin: 20px 0 0 0;">
          Didn't create an account? You can safely ignore this email.
        </p>

      </body>
    </html>
  `;
}
