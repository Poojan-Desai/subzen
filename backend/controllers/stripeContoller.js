// controllers/stripeController.js

import Stripe from "stripe";
import supabase from "../utils/supabaseClient.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// ------------------------------
//  Create Checkout Session
// ------------------------------
export const createCheckoutSession = async (req, res) => {
  const { plan } = req.body;
  const user = req.user;

  if (!plan || !["pro", "premium"].includes(plan)) {
    return res.status(400).json({ error: "Invalid plan selected" });
  }

  try {
    const priceId =
      plan === "pro"
        ? process.env.STRIPE_PRICE_PRO
        : process.env.STRIPE_PRICE_PREMIUM;

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/settings.html?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing.html?canceled=true`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
};

// ------------------------------
//  Stripe Webhook Handler
// ------------------------------
export const handleStripeWebhook = async (req, res) => {
  let event;
  const signature = req.headers["stripe-signature"];

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature error:", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const data = event.data.object;

  switch (event.type) {
    case "checkout.session.completed":
      await updateUserPlan(data.customer_email, data);
      break;

    case "invoice.payment_succeeded":
      // Renewing subscription
      await updateUserPlan(data.customer_email, data);
      break;

    case "customer.subscription.deleted":
      await downgradeUser(data.customer_email);
      break;
  }

  res.status(200).json({ received: true });
};

// ------------------------------
//  Helper: Save user plan to Supabase
// ------------------------------
async function updateUserPlan(email, data) {
  if (!email) return;

  const plan =
    data.lines?.data?.[0]?.plan?.id === process.env.STRIPE_PRICE_PREMIUM
      ? "premium"
      : "pro";

  await supabase
    .from("users")
    .update({ plan })
    .eq("email", email);

  console.log(`✅ Updated ${email} to plan: ${plan}`);
}

async function downgradeUser(email) {
  if (!email) return;
  await supabase.from("users").update({ plan: "free" }).eq("email", email);
  console.log(`⚠️ Downgraded ${email} to FREE`);
}