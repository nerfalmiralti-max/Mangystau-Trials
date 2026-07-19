import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { enforceRateLimit, rejectCrossSiteMutation } from "@/lib/apiSecurity";
import { readRequestSession } from "@/lib/auth";
import {
  type ContactValidationResult,
  validateContactInput,
} from "@/lib/contactValidation";

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
export const maxDuration = 20;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const contactBodyLimit = 8 * 1024;
const storedMessage =
  "Your route request has been saved. We'll use the details to help prepare your Mangystau journey.";

export async function POST(request: Request) {
  const originError = rejectCrossSiteMutation(request);
  if (originError) return originError;

  const rateLimitError = enforceRateLimit(request, {
    namespace: "contact:create",
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });
  if (rateLimitError) return rateLimitError;

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > contactBodyLimit) {
    return requestTooLarge();
  }

  let body: unknown;

  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > contactBodyLimit) {
      return requestTooLarge();
    }
    body = JSON.parse(rawBody) as unknown;
  } catch {
    return validationError({
      ok: false,
      data: null,
      errors: {},
      formError: "Send the form again with valid details.",
    });
  }

  const validation = validateContactInput(body);
  if (!validation.ok) return validationError(validation);

  if (!process.env.DATABASE_URL?.trim()) {
    return NextResponse.json(
      {
        ok: false,
        code: "CONTACT_UNAVAILABLE",
        error: "Secure route requests are temporarily unavailable. Your details are still in the form.",
        retryable: true,
      },
      { status: 503 }
    );
  }

  const { requestId } = validation.data;
  const contact = {
    name: validation.data.name,
    email: validation.data.email,
    travelWindow: validation.data.travelWindow,
    message: validation.data.message,
  };
  let contactRecordId: string;

  try {
    const { prisma } = await import("@/lib/prisma");
    const existing = await prisma.contactMessage.findUnique({
      where: { submissionId: requestId },
      select: {
        id: true,
        name: true,
        email: true,
        travelWindow: true,
        message: true,
      },
    });

    if (existing) {
      return duplicateResponse(existing, contact);
    }

    const session = readRequestSession(request);
    const tourist = session
      ? await prisma.tourist.findUnique({ where: { id: session.id }, select: { id: true } })
      : null;
    const contactRecord = await prisma.contactMessage.create({
      data: {
        ...contact,
        submissionId: requestId,
        touristId: tourist?.id ?? null,
        status: "stored",
      },
      select: { id: true },
    });
    contactRecordId = contactRecord.id;
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      try {
        const { prisma } = await import("@/lib/prisma");
        const existing = await prisma.contactMessage.findUnique({
          where: { submissionId: requestId },
          select: {
            id: true,
            name: true,
            email: true,
            travelWindow: true,
            message: true,
          },
        });
        if (existing) return duplicateResponse(existing, contact);
      } catch (lookupError) {
        logContactIssue("save", lookupError);
      }
    }

    logContactIssue("save", error);
    return NextResponse.json(
      {
        ok: false,
        code: "CONTACT_SAVE_FAILED",
        error: "We could not save your route request. Your details are still in the form; please try again.",
        retryable: true,
      },
      { status: 500 }
    );
  }

  const smtp = getSmtpConfig();
  if (!smtp) return storedResponse();

  try {
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
      connectionTimeout: 8_000,
      greetingTimeout: 8_000,
      socketTimeout: 10_000,
    });
    const teamText = [
      `Name: ${contact.name}`,
      `Email: ${contact.email}`,
      `Travel window: ${contact.travelWindow}`,
      "",
      contact.message,
    ].join("\n");
    const teamHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2>New Mangystau Trails route request</h2>
        <p><strong>Name:</strong> ${escapeHtml(contact.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(contact.email)}</p>
        <p><strong>Travel window:</strong> ${escapeHtml(contact.travelWindow)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(contact.message).replace(/\n/g, "<br />")}</p>
      </div>
    `;
    await transporter.sendMail({
      to: smtp.contactEmail,
      from: { name: "Mangystau Trails", address: smtp.from },
      replyTo: { name: contact.name, address: contact.email },
      subject: `New Mangystau Trails request from ${contact.name}`,
      text: teamText,
      html: teamHtml,
    });

    await updateDeliveryStatus(contactRecordId, "sent");
    return NextResponse.json(
      { ok: true, code: "CONTACT_STORED_AND_NOTIFIED", message: storedMessage },
      { status: 201 }
    );
  } catch (error) {
    logContactIssue("email", error);
    await updateDeliveryStatus(contactRecordId, "email_failed");
    return storedResponse();
  }
}

function requestTooLarge() {
  return NextResponse.json(
    {
      ok: false,
      code: "CONTACT_REQUEST_TOO_LARGE",
      error: "The route request is too large. Shorten the message and try again.",
      retryable: false,
    },
    { status: 413 }
  );
}

function duplicateResponse(
  existing: {
    name: string;
    email: string;
    travelWindow: string | null;
    message: string;
  },
  contact: { name: string; email: string; travelWindow: string; message: string }
) {
  const isSameRequest =
    existing.name === contact.name &&
    existing.email === contact.email &&
    existing.travelWindow === contact.travelWindow &&
    existing.message === contact.message;

  if (!isSameRequest) {
    return NextResponse.json(
      {
        ok: false,
        code: "CONTACT_REQUEST_CONFLICT",
        error:
          "An earlier version of this request was already saved. Review your updated details and send again.",
        retryable: true,
        resetRequestId: true,
      },
      { status: 409 }
    );
  }

  return NextResponse.json({
    ok: true,
    code: "CONTACT_ALREADY_STORED",
    message: storedMessage,
  });
}

function validationError(validation: Extract<ContactValidationResult, { ok: false }>) {
  return NextResponse.json(
    {
      ok: false,
      code: "INVALID_CONTACT_REQUEST",
      error: validation.formError || "Check the highlighted fields and try again.",
      fieldErrors: validation.errors,
      retryable: false,
    },
    { status: 400 }
  );
}

function storedResponse() {
  return NextResponse.json(
    {
      ok: true,
      code: "CONTACT_STORED",
      message: storedMessage,
    },
    { status: 201 }
  );
}

async function updateDeliveryStatus(contactRecordId: string, status: "sent" | "email_failed") {
  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.contactMessage.update({
      where: { id: contactRecordId },
      data: { status },
    });
  } catch (error) {
    logContactIssue("status", error);
  }
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
    port < 1 ||
    port > 65535 ||
    !user ||
    !pass
  ) {
    return null;
  }

  const secure = process.env.SMTP_SECURE?.toLowerCase() === "true" || port === 465;
  const from = stripHeader(process.env.SMTP_FROM?.trim() || user);
  if (!emailPattern.test(from)) return null;

  return { contactEmail, host, port, user, pass, secure, from };
}

function stripHeader(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function isUniqueConstraintError(error: unknown) {
  return readErrorCode(error) === "P2002";
}

function readErrorCode(error: unknown) {
  if (!error || typeof error !== "object" || !("code" in error)) return null;
  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code.slice(0, 32) : null;
}

function logContactIssue(stage: "save" | "email" | "status", error: unknown) {
  console.error("Contact request operation failed", {
    stage,
    name: error instanceof Error ? error.name : "UnknownError",
    code: readErrorCode(error),
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
