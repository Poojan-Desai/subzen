// backend/middleware/errorHandler.js

// GLOBAL ERROR HANDLER MIDDLEWARE
// --------------------------------
// Any controller can throw an error using:  throw new Error("Message")

module.exports = (err, req, res, next) => {
  console.error("🔥 Backend Error:", err.message);

  // Default status
  const status = err.statusCode || 500;

  // Prevent server from leaking internal details
  return res.status(status).json({
    ok: false,
    error: err.message || "Internal server error",
  });
};