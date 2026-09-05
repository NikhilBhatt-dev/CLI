import express from "express";

import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/adminMiddleware.js";
import {
  deactivateSubscriberController,
  getSubscribersController,
  sendNewsletterController,
  subscribeController,
} from "../controllers/newsletter.controller.js";

const router = express.Router();

router.post("/subscribe", subscribeController);
router.get("/subscribers", protect, authorize("admin"), getSubscribersController);
router.delete("/subscribers/:id", protect, authorize("admin"), deactivateSubscriberController);
router.post("/send", protect, authorize("admin"), sendNewsletterController);

export default router;
