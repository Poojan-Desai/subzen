// backend/controllers/planController.js
const supabase = require("../utils/supabaseClient");

// Plan limits
const PLAN_LIMITS = {
  free: { uploads: 1 },
  pro: { uploads: 20 },
  premium: { uploads: 9999 },
};

/**
 * Save or update a user's plan.
 */
exports.updatePlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { plan } = req.body;

    if (!plan || !PLAN_LIMITS[plan]) {
      return res.status(400).json({ error: "Invalid plan." });
    }

    // Save plan to database
    const { error } = await supabase
      .from("users")
      .update({
        plan,
        uploads_left: PLAN_LIMITS[plan].uploads,
      })
      .eq("id", userId);

    if (error) throw error;

    res.json({ ok: true, message: "Plan updated.", plan });
  } catch (err) {
    console.log("updatePlan error:", err);
    res.status(500).json({ error: "Failed to update plan." });
  }
};

/**
 * Get the user's current plan + uploads remaining.
 */
exports.getPlanStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("users")
      .select("plan, uploads_left")
      .eq("id", userId)
      .single();

    if (error) throw error;

    res.json({
      ok: true,
      plan: data.plan || "free",
      uploads_left: data.uploads_left ?? 0,
    });
  } catch (err) {
    console.log("getPlanStatus error:", err);
    res.status(500).json({ error: "Could not get plan status." });
  }
};

/**
 * Called after a successful PDF/CSV analysis.
 * Reduces remaining uploads.
 */
exports.decrementUpload = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("uploads_left")
      .eq("id", userId)
      .single();

    if (error) throw error;

    let left = data.uploads_left ?? 0;
    left = Math.max(0, left - 1);

    await supabase
      .from("users")
      .update({ uploads_left: left })
      .eq("id", userId);

    return left;
  } catch (err) {
    console.log("decrementUpload error:", err);
    return null;
  }
};