import express from "express";
import { verifyAuth } from "../utils/verifyAuth.js";
import {
  createCheckoutSession,
  handleStripeWebhook,
} from "../controllers/stripeController.js";

const router = express.Router();

// For creating checkout sessions (authenticated users only)
router.post("/create-checkout-session", verifyAuth, createCheckoutSession);

// Stripe webhook (NO auth, must use raw body)
router.post("/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

export default router;