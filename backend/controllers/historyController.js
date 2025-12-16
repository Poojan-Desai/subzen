// controllers/historyController.js

const supabase = require("../utils/supabaseClient");

// GET /api/history
exports.getHistory = async (req, res) => {
  try {
    const email = req.user.email;

    const { data, error } = await supabase
      .from("scans")
      .select("*")
      .eq("email", email)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase history error:", error);
      return res.status(500).json({ ok: false, error: "Failed to load history." });
    }

    return res.json({ ok: true, history: data || [] });
  } catch (err) {
    console.error("History error:", err);
    return res.status(500).json({ ok: false, error: "Server error loading history." });
  }
};