const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function layout(content: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:#B31B1B;padding:24px 32px;border-radius:8px 8px 0 0;">
            <span style="color:#ffffff;font-size:20px;font-weight:bold;">Cornell Project Teams</span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:32px;border-radius:0 0 8px 8px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px;text-align:center;color:#71717a;font-size:12px;">
            This is an automated notification from the Cornell Project Team Common App.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}

function button(href: string, label: string) {
  return `
<table cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr>
    <td style="background:#B31B1B;border-radius:6px;padding:12px 24px;">
      <a href="${href}" style="color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;">${label}</a>
    </td>
  </tr>
</table>`;
}

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function statusChangeEmail({
  applicantName,
  teamName,
  newStatus,
}: {
  applicantName: string;
  teamName: string;
  newStatus: string;
}) {
  const subject = `Application Update: ${teamName} — ${formatStatus(newStatus)}`;
  const html = layout(`
    <h2 style="margin:0 0 16px;color:#18181b;font-size:18px;">Application Status Updated</h2>
    <p style="margin:0 0 8px;color:#3f3f46;font-size:14px;line-height:1.6;">
      Hi ${applicantName},
    </p>
    <p style="margin:0 0 16px;color:#3f3f46;font-size:14px;line-height:1.6;">
      Your application to <strong>${teamName}</strong> has been updated to:
    </p>
    <p style="margin:0 0 24px;font-size:16px;font-weight:bold;color:#B31B1B;">
      ${formatStatus(newStatus)}
    </p>
    ${button(`${BASE_URL}/applications`, "View Your Applications")}
  `);
  return { subject, html };
}

export function teamMessageEmail({
  applicantName,
  teamName,
  messagePreview,
}: {
  applicantName: string;
  teamName: string;
  messagePreview: string;
}) {
  const subject = `New message from ${teamName}`;
  const preview = messagePreview.slice(0, 200) + (messagePreview.length > 200 ? "..." : "");
  const html = layout(`
    <h2 style="margin:0 0 16px;color:#18181b;font-size:18px;">New Message</h2>
    <p style="margin:0 0 8px;color:#3f3f46;font-size:14px;line-height:1.6;">
      Hi ${applicantName},
    </p>
    <p style="margin:0 0 16px;color:#3f3f46;font-size:14px;line-height:1.6;">
      You received a new message from <strong>${teamName}</strong>:
    </p>
    <blockquote style="margin:0 0 24px;padding:12px 16px;background:#f4f4f5;border-left:4px solid #B31B1B;border-radius:4px;color:#3f3f46;font-size:14px;line-height:1.6;">
      ${preview}
    </blockquote>
    ${button(`${BASE_URL}/applications`, "View Your Applications")}
  `);
  return { subject, html };
}

export function applicantMessageEmail({
  applicantName,
  teamName,
  messagePreview,
  teamId,
  applicationId,
}: {
  applicantName: string;
  teamName: string;
  messagePreview: string;
  teamId: string;
  applicationId: string;
}) {
  const subject = `New message from applicant ${applicantName}`;
  const preview = messagePreview.slice(0, 200) + (messagePreview.length > 200 ? "..." : "");
  const html = layout(`
    <h2 style="margin:0 0 16px;color:#18181b;font-size:18px;">New Applicant Message</h2>
    <p style="margin:0 0 8px;color:#3f3f46;font-size:14px;line-height:1.6;">
      Hi ${teamName} team,
    </p>
    <p style="margin:0 0 16px;color:#3f3f46;font-size:14px;line-height:1.6;">
      <strong>${applicantName}</strong> sent a new message on their application:
    </p>
    <blockquote style="margin:0 0 24px;padding:12px 16px;background:#f4f4f5;border-left:4px solid #B31B1B;border-radius:4px;color:#3f3f46;font-size:14px;line-height:1.6;">
      ${preview}
    </blockquote>
    ${button(`${BASE_URL}/admin/${teamId}/applications/${applicationId}`, "View Application")}
  `);
  return { subject, html };
}
