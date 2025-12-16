import express from "express";
import stripeWebhookController from "../controllers/stripeWebhookController.js";

const router = express.Router();

// Stripe Webhook must NOT use JSON middleware
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhookController.handleWebhook
);

export default router;