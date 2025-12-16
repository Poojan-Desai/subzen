const supabase = require("./supabaseClient");

module.exports = async function verifyAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid Authorization header." });
    }

    const token = authHeader.replace("Bearer ", "").trim();

    // Verify token using Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ error: "Unauthorized or invalid session." });
    }

    // Attach user to request
    req.user = data.user;

    next();
  } catch (err) {
    console.error("Auth verification error:", err);
    return res.status(500).json({ error: "Internal authentication error." });
  }
};