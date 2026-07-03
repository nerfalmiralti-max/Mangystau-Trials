import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

type ContactRequest = {
  name?: unknown;
  email?: unknown;
  travelWindow?: unknown;
  message?: unknown;
  company?: unknown;
};

type SmtpConfig = {
  contactEmail: string;
  host: string;
  port: number;
  user: string;
  pass: string;
  secure: boolean;
  from: string;
};

export const runtime = "nodejs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.replace(/\0/g, "").trim().slice(0, maxLength);
}

function stripHeader(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function getSmtpConfig(): SmtpConfig | null {
  const contactEmail = stripHeader(process.env.CONTACT_EMAIL?.trim() ?? "");
  const host = stripHeader(process.env.SMTP_HOST?.trim() ?? "");
  const port = Number(process.env.SMTP_PORT || "587");
  const user = stripHeader(process.env.SMTP_USER?.trim() ?? "");
  const pass = process.env.SMTP_PASS;

  if (
    !contactEmail ||
    !emailPattern.test(contactEmail) ||
    !host ||
    !Number.isFinite(port) ||
    !user ||
    !pass
  ) {
    return null;
  }

  const secure =
    process.env.SMTP_SECURE?.toLowerCase() === "true" || port === 465;
  const from = stripHeader(process.env.SMTP_FROM?.trim() || user);

  if (!emailPattern.test(from)) {
    return null;
  }

  return {
    contactEmail,
    host,
    port,
    user,
    pass,
    secure,
    from,
  };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ContactRequest;
  const name = stripHeader(readText(body.name, 80));
  const email = stripHeader(readText(body.email, 120).toLowerCase());
  const travelWindow = stripHeader(readText(body.travelWindow, 120));
  const message = readText(body.message, 4000);
  const company = readText(body.company, 120);

  if (company) {
    return NextResponse.json({
      ok: true,
      message: "Message sent. We will reply by email soon.",
    });
  }

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email and message are required." },
      { status: 400 }
    );
  }

  if (!emailPattern.test(email)) {
    return NextResponse.json(
      { error: "Please use a valid email address." },
      { status: 400 }
    );
  }

  if (message.length < 12) {
    return NextResponse.json(
      { error: "Please add a few more details about the trip." },
      { status: 400 }
    );
  }

  const smtp = getSmtpConfig();

  if (!smtp) {
    return NextResponse.json(
      {
        error:
          "Contact email is not configured yet. Please set CONTACT_EMAIL, SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS.",
      },
      { status: 503 }
    );
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });

  try {
    const teamText = [
      `Name: ${name}`,
      `Email: ${email}`,
      travelWindow ? `Travel window: ${travelWindow}` : "",
      "",
      message,
    ]
      .filter(Boolean)
      .join("\n");
    const teamHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2>New MangystauTrails request</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          ${
            travelWindow
              ? `<p><strong>Travel window:</strong> ${escapeHtml(travelWindow)}</p>`
              : ""
          }
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
        </div>
      `;
    const travelerText = [
      `Hi ${name},`,
      "",
      "We received your MangystauTrails route request and will reply by email soon.",
      travelWindow ? `Travel window: ${travelWindow}` : "",
      "",
      "Your message:",
      message,
      "",
      "MangystauTrails",
    ]
      .filter(Boolean)
      .join("\n");
    const travelerHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2>We received your route request</h2>
          <p>Hi ${escapeHtml(name)},</p>
          <p>Thanks for contacting MangystauTrails. We will reply by email soon with practical route notes.</p>
          ${
            travelWindow
              ? `<p><strong>Travel window:</strong> ${escapeHtml(travelWindow)}</p>`
              : ""
          }
          <p><strong>Your message:</strong></p>
          <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
        </div>
      `;

    await Promise.all([
      transporter.sendMail({
        to: smtp.contactEmail,
        from: `"MangystauTrails" <${smtp.from}>`,
        replyTo: `"${name}" <${email}>`,
        subject: `New MangystauTrails request from ${name}`,
        text: teamText,
        html: teamHtml,
      }),
      transporter.sendMail({
        to: email,
        from: `"MangystauTrails" <${smtp.from}>`,
        replyTo: smtp.contactEmail,
        subject: "We received your MangystauTrails request",
        text: travelerText,
        html: travelerHtml,
      }),
    ]);

    return NextResponse.json({
      ok: true,
      message: "Message sent. We sent a confirmation to your email.",
    });
  } catch (error) {
    console.error("Contact email failed", error);

    return NextResponse.json(
      { error: "Email service is unavailable right now. Please try again later." },
      { status: 502 }
    );
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
