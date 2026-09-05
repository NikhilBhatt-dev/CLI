import nodemailer from "nodemailer";

import NewsletterSubscriber from "../models/NewsletterSubscriber.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

export const createSmtpTransport = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_EMAIL } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT || 587) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

export const getSmtpFromEmail = () => (
  process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "no-reply@example.com"
);

export const subscribeToNewsletter = async (email) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
    throw new ApiError(400, "Please enter a valid email address.");
  }

  const existingSubscriber = await NewsletterSubscriber.findOne({ email: normalizedEmail });

  if (existingSubscriber && existingSubscriber.isActive) {
    throw new ApiError(409, "Already subscribed");
  }

  if (existingSubscriber) {
    existingSubscriber.isActive = true;
    existingSubscriber.unsubscribedAt = null;
    existingSubscriber.subscribedAt = new Date();
    await existingSubscriber.save();

    return new ApiResponse(200, { subscriber: existingSubscriber }, "Welcome back! You are subscribed again.");
  }

  const subscriber = await NewsletterSubscriber.create({
    email: normalizedEmail,
    isActive: true,
    subscribedAt: new Date(),
  });

  return new ApiResponse(201, { subscriber }, "Successfully subscribed to the newsletter.");
};

export const getNewsletterSubscribers = async (query = {}) => {
  const { search = "", isActive = "" } = query;

  const filter = {};

  if (search) {
    filter.email = { $regex: search, $options: "i" };
  }

  if (isActive === "true") {
    filter.isActive = true;
  }

  if (isActive === "false") {
    filter.isActive = false;
  }

  const subscribers = await NewsletterSubscriber.find(filter).sort({ createdAt: -1 }).lean();

  return new ApiResponse(200, { subscribers }, "Newsletter subscribers fetched successfully.");
};

export const deactivateSubscriber = async (id) => {
  const subscriber = await NewsletterSubscriber.findById(id);

  if (!subscriber) {
    throw new ApiError(404, "Subscriber not found");
  }

  subscriber.isActive = false;
  subscriber.unsubscribedAt = new Date();
  await subscriber.save();

  return new ApiResponse(200, { subscriber }, "Subscriber deactivated successfully.");
};

export const sendNewsletterToSubscribers = async ({ subject, content, subscriberIds = [] }) => {
  if (!subject || !String(subject).trim()) {
    throw new ApiError(400, "Newsletter subject is required.");
  }

  if (!content || !String(content).trim()) {
    throw new ApiError(400, "Newsletter content is required.");
  }

  const filter = { isActive: true };

  if (subscriberIds && subscriberIds.length) {
    filter._id = { $in: subscriberIds };
  }

  const subscribers = await NewsletterSubscriber.find(filter).lean();

  if (!subscribers.length) {
    return new ApiResponse(200, { sent: 0, failed: 0 }, "No active subscribers available.");
  }

  const transporter = createSmtpTransport();
  const fromEmail = getSmtpFromEmail();

  let successCount = 0;
  let failedCount = 0;

  for (const subscriber of subscribers) {
    try {
      if (transporter) {
        await transporter.sendMail({
          from: fromEmail,
          to: subscriber.email,
          subject,
          html: `<div style="font-family: Arial, sans-serif; line-height: 1.7; color: #1f2937;">
            <h2 style="color: #ff7a45; margin-bottom: 12px;">${String(subject).replace(/</g, "&lt;").replace(/>/g, "&gt;")}</h2>
            <div>${String(content)}</div>
          </div>`,
        });
      }

      await NewsletterSubscriber.findByIdAndUpdate(subscriber._id, { lastSentAt: new Date() });
      successCount += 1;
    } catch (error) {
      failedCount += 1;
    }
  }

  return new ApiResponse(
    200,
    {
      sent: successCount,
      failed: failedCount,
      total: subscribers.length,
    },
    "Newsletter sending completed.",
  );
};
