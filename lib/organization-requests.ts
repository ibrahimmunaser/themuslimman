"use server";

import { Resend } from "resend";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/auth";

// ── Types ─────────────────────────────────────────────────────────────────────

export type OrgRequestFormData = {
  organizationName:  string;
  contactName:       string;
  contactEmail:      string;
  contactPhone?:     string;
  country?:          string;
  city?:             string;
  organizationType?: string;
  estimatedStudents?: string;
  message?:          string;
};

// ── Email helper ──────────────────────────────────────────────────────────────

async function sendAdminNotification(request: OrgRequestFormData & { id: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;

  if (!apiKey || apiKey === "re_your_api_key_here") {
    console.warn("[org-requests] RESEND_API_KEY not configured — skipping email.");
    return;
  }
  if (!adminEmail) {
    console.warn("[org-requests] ADMIN_NOTIFICATION_EMAIL not configured — skipping email.");
    return;
  }

  const resend = new Resend(apiKey);

  const locationParts = [request.city, request.country].filter(Boolean).join(", ");
  const orgTypeLabel = request.organizationType
    ? request.organizationType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Not specified";

  await resend.emails.send({
    from: "TheMuslimMan Platform <onboarding@resend.dev>",
    to:   adminEmail,
    subject: `New school access request — ${request.organizationName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0d0d0d; color: #e0e0e0; padding: 32px; border-radius: 12px;">
        <h2 style="color: #c9a84c; margin-top: 0;">New Organization Access Request</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr>
            <td style="padding: 8px 0; color: #888; width: 170px; vertical-align: top;">Organization</td>
            <td style="padding: 8px 0; font-weight: 600; color: #fff;">${request.organizationName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888; vertical-align: top;">Org Type</td>
            <td style="padding: 8px 0;">${orgTypeLabel}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888; vertical-align: top;">Contact</td>
            <td style="padding: 8px 0;">${request.contactName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888; vertical-align: top;">Email</td>
            <td style="padding: 8px 0;"><a href="mailto:${request.contactEmail}" style="color: #c9a84c;">${request.contactEmail}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888; vertical-align: top;">Phone</td>
            <td style="padding: 8px 0;">${request.contactPhone || "—"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888; vertical-align: top;">Location</td>
            <td style="padding: 8px 0;">${locationParts || "—"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888; vertical-align: top;">Est. students</td>
            <td style="padding: 8px 0;">${request.estimatedStudents || "—"}</td>
          </tr>
          ${request.message ? `
          <tr>
            <td style="padding: 8px 0; color: #888; vertical-align: top;">Message</td>
            <td style="padding: 8px 0; white-space: pre-line;">${request.message}</td>
          </tr>` : ""}
        </table>
        <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #222;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/admin/organization-requests"
             style="background: #c9a84c; color: #0d0d0d; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px;">
            View in Admin Dashboard →
          </a>
        </div>
      </div>
    `,
  });
}

// ── Public action: submit request ─────────────────────────────────────────────

export async function submitOrganizationRequest(
  data: OrgRequestFormData
): Promise<{ success: boolean; error?: string }> {
  // Validate required fields
  if (!data.organizationName?.trim())
    return { success: false, error: "Organization name is required." };
  if (!data.contactName?.trim())
    return { success: false, error: "Contact name is required." };
  if (!data.contactEmail?.trim())
    return { success: false, error: "Email is required." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail.trim()))
    return { success: false, error: "Please enter a valid email address." };

  try {
    const record = await prisma.organizationAccessRequest.create({
      data: {
        organizationName:  data.organizationName.trim(),
        contactName:       data.contactName.trim(),
        contactEmail:      data.contactEmail.trim().toLowerCase(),
        contactPhone:      data.contactPhone?.trim()       || null,
        country:           data.country?.trim()            || null,
        city:              data.city?.trim()               || null,
        organizationType:  data.organizationType?.trim()   || null,
        estimatedStudents: data.estimatedStudents?.trim()  || null,
        message:           data.message?.trim()            || null,
        status:            "new",
      },
    });

    // Fire-and-forget notification — don't fail the submission if email breaks
    sendAdminNotification({ ...data, id: record.id }).catch((err) => {
      console.error("[org-requests] Email notification failed:", err);
    });

    return { success: true };
  } catch (err) {
    console.error("[org-requests] DB save failed:", err);
    return { success: false, error: "Failed to save your request. Please try again." };
  }
}

// ── Admin action: update request status ───────────────────────────────────────

export type RequestStatus = "new" | "contacted" | "approved" | "rejected";

export async function updateRequestStatus(
  requestId: string,
  status: RequestStatus
): Promise<{ success: boolean; error?: string }> {
  await requirePlatformAdmin();

  const allowed: RequestStatus[] = ["new", "contacted", "approved", "rejected"];
  if (!allowed.includes(status))
    return { success: false, error: "Invalid status value." };

  try {
    await prisma.organizationAccessRequest.update({
      where: { id: requestId },
      data:  { status },
    });
    revalidatePath("/admin/organization-requests");
    revalidatePath("/admin/school-requests");
    return { success: true };
  } catch (err) {
    console.error("[org-requests] Status update failed:", err);
    return { success: false, error: "Update failed. Please try again." };
  }
}
