import Stripe from "stripe";
import supabase from "../utils/supabaseClient.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const stripeWebhookController = {
  handleWebhook: async (req, res) => {
    let event;

    try {
      const signature = req.headers["stripe-signature"];
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userEmail = session.customer_email;
        const priceId = session.metadata.price_id;

        let plan = "free";
        let uploads = 1;

        if (priceId === process.env.STRIPE_PRICE_PRO) {
          plan = "pro";
          uploads = 15;
        } else if (priceId === process.env.STRIPE_PRICE_PREMIUM) {
          plan = "premium";
          uploads = 50;
        }

        // Update user in Supabase
        await supabase
          .from("profiles")
          .update({ plan: plan, uploads_left: uploads })
          .eq("email", userEmail);

        console.log("Updated plan for:", userEmail);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  },
};

export default stripeWebhookController;