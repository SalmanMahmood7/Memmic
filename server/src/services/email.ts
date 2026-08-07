import nodemailer from "nodemailer";
import { settings } from "../config";
import { logger } from "../logger";

function buildTransporter() {
  return nodemailer.createTransport({
    host: settings.MAIL_SERVER,
    port: settings.MAIL_PORT,
    secure: false, // matches Python's smtplib + starttls()
    requireTLS: true,
    auth: {
      user: settings.MAIL_FROM,
      pass: settings.MAIL_PASSWORD,
    },
  });
}

async function sendMail(to: string, subject: string, body: string): Promise<boolean> {
  try {
    const transporter = buildTransporter();
    await transporter.sendMail({
      from: settings.MAIL_FROM,
      to,
      subject,
      text: body,
    });
    return true;
  } catch (err) {
    logger.error(`Failed to send email to ${to}: ${err}`);
    return false;
  }
}

export async function sendNotificationEmail(name: string, email: string, message: string): Promise<void> {
  const subject = `New Contact Form Submission from ${name}`;
  const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
  await sendMail(settings.MAIL_FROM, subject, body);
}

export async function sendCredentialsEmail(
  recipient: string,
  generatedEmail: string,
  generatedPassword: string,
  fullName: string
): Promise<boolean> {
  const subject = "Your MEMMIC Portal Credentials";
  const body = `Dear ${fullName},

Your enquiry has been approved. Here are your credentials for the MEMMIC client portal:

Portal email: ${generatedEmail}
Portal password: ${generatedPassword}

Please keep these credentials safe and use them to sign in at the MEMMIC client portal.

Best regards,
The MEMMIC Team
`;
  return sendMail(recipient, subject, body);
}

export async function sendWelcomeEmail(
  recipient: string,
  fullName: string,
  portalEmail: string,
  password: string,
  portalType: string
): Promise<boolean> {
  const portalLabel = portalType
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const subject = `Your MEMMIC ${portalLabel} Portal Account`;
  const body = `Dear ${fullName},

Your ${portalLabel} portal account has been created. Here are your login details:

Portal: ${portalLabel}
Email: ${portalEmail}
Password: ${password}

You can sign in at the MEMMIC client portal using these credentials.

Best regards,
The MEMMIC Team
`;
  return sendMail(recipient, subject, body);
}
