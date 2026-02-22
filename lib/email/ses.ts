import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({
  region: process.env.AWS_SES_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY!,
  },
});

export async function sendEmail(
  to: string | string[],
  subject: string,
  html: string
) {
  const recipients = Array.isArray(to) ? to : [to];

  try {
    await ses.send(
      new SendEmailCommand({
        Source: process.env.SES_FROM_EMAIL!,
        Destination: { ToAddresses: recipients },
        Message: {
          Subject: { Data: subject },
          Body: { Html: { Data: html } },
        },
      })
    );
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}
