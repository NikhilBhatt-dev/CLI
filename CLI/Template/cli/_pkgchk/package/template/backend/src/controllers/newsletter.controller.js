import asyncHandler from "../utils/asyncHandler.js";
import * as newsletterService from "../services/newsletter.service.js";

export const subscribeController = asyncHandler(async (req, res) => {
  const result = await newsletterService.subscribeToNewsletter(req.body.email);
  res.status(result.statusCode || 200).json(result);
});

export const getSubscribersController = asyncHandler(async (req, res) => {
  const result = await newsletterService.getNewsletterSubscribers(req.query);
  res.status(200).json(result);
});

export const deactivateSubscriberController = asyncHandler(async (req, res) => {
  const result = await newsletterService.deactivateSubscriber(req.params.id);
  res.status(200).json(result);
});

export const sendNewsletterController = asyncHandler(async (req, res) => {
  const result = await newsletterService.sendNewsletterToSubscribers(req.body);
  res.status(200).json(result);
});
