import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { createSmtpTransport, getSmtpFromEmail } from "./newsletter.service.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const cleanText = (value) => String(value || "").trim();

const escapeHtml = (value) => value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

export const sendContactMessage = async ({ name, email, subject, message }) => {
  const cleanName = cleanText(name);
  const cleanEmail = cleanText(email).toLowerCase();
  const cleanSubject = cleanText(subject);
  const cleanMessage = cleanText(message);

  if (!cleanName || !cleanEmail || !cleanSubject || !cleanMessage) {
    throw new ApiError(400, "Please complete all contact form fields.");
  }

  if (!emailRegex.test(cleanEmail)) {
    throw new ApiError(400, "Please enter a valid email address.");
  }

  if (cleanName.length > 100 || cleanEmail.length > 254 || cleanSubject.length > 200 || cleanMessage.length > 5000) {
    throw new ApiError(400, "Please shorten your message and try again.");
  }

  const transporter = createSmtpTransport();
  const fromEmail = getSmtpFromEmail();
  const recipient = process.env.CONTACT_TO_EMAIL || fromEmail;

  if (!transporter || !recipient) {
    throw new ApiError(503, "Our contact service is temporarily unavailable. Please try again later.");
  }

  try {
    await transporter.sendMail({
      from: fromEmail,
      to: recipient,
      replyTo: cleanEmail,
      subject: `[Contact] ${cleanSubject}`,
      text: `Name: ${cleanName}\nEmail: ${cleanEmail}\n\nMessage:\n${cleanMessage}`,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;">
        <h2 style="color:#ff7a45;">New contact message</h2>
        <p><strong>Name:</strong> ${escapeHtml(cleanName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(cleanEmail)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(cleanSubject)}</p>
        <p><strong>Message:</strong><br>${escapeHtml(cleanMessage).replace(/\n/g, "<br>")}</p>
      </div>`,
    });
  } catch (error) {
    console.error("Contact email delivery failed:", error.message);
    throw new ApiError(503, "We could not send your message right now. Please try again later.");
  }

  return new ApiResponse(200, null, "Your message has been sent successfully.");
};
