import express from "express";
import { submitContactController } from "../controllers/contact.controller.js";

const router = express.Router();

router.post("/", submitContactController);

export default router;
