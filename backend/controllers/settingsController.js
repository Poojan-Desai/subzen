// controllers/settingsController.js

const supabase = require("../utils/supabaseClient");

/* -----------------------------
   UPDATE DISPLAY NAME
------------------------------*/
exports.updateName = async (req, res) => {
  try {
    const email = req.user.email;
    const { newName } = req.body;

    if (!newName) {
      return res.status(400).json({ ok: false, error: "Missing newName field." });
    }

    const { error } = await supabase
      .from("users")
      .update({ display_name: newName })
      .eq("email", email);

    if (error) {
      console.error("Name update error:", error);
      return res.status(500).json({ ok: false, error: "Failed to update name." });
    }

    return res.json({ ok: true, message: "Name updated successfully." });
  } catch (err) {
    console.error("Name update exception:", err);
    return res.status(500).json({ ok: false, error: "Server error." });
  }
};

/* -----------------------------
   UPDATE NOTIFICATION SETTINGS
------------------------------*/
exports.updateNotifications = async (req, res) => {
  try {
    const email = req.user.email;
    const { emailNotifications } = req.body;

    const { error } = await supabase
      .from("users")
      .update({ email_notifications: emailNotifications })
      .eq("email", email);

    if (error) {
      console.error("Notification update error:", error);
      return res.status(500).json({ ok: false, error: "Failed to update notifications." });
    }

    return res.json({ ok: true, message: "Notification settings updated." });
  } catch (err) {
    console.error("Notification exception:", err);
    return res.status(500).json({ ok: false, error: "Server error." });
  }
};

/* -----------------------------
   DELETE ACCOUNT
------------------------------*/
exports.deleteAccount = async (req, res) => {
  try {
    const email = req.user.email;

    // Delete user data from scans table
    await supabase.from("scans").delete().eq("email", email);

    // Delete user profile data from users table
    await supabase.from("users").delete().eq("email", email);

    // Delete from Supabase Auth
    const { data, error } = await supabase.auth.admin.deleteUser(req.user.id);

    if (error) {
      console.error("Auth delete error:", error);
      return res.status(500).json({ ok: false, error: "Failed to delete user from auth." });
    }

    return res.json({
      ok: true,
      message: "Account deleted successfully."
    });
  } catch (err) {
    console.error("Delete account exception:", err);
    return res.status(500).json({ ok: false, error: "Server error deleting account." });
  }
};