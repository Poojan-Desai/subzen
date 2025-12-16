require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");

// Import routes
const analyzeRoutes = require("./routes/analyzeRoutes");
const planRoutes = require("./routes/planRoutes");
const historyRoutes = require("./routes/historyRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const stripeRoutes = require("./routes/stripeRoutes");

const app = express();

// -----------------------
// CORS CONFIG
// -----------------------
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // example: https://subzen.netlify.app
    credentials: true,
  })
);

// -----------------------
// MIDDLEWARE
// -----------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload()); // for PDF + CSV uploads

// -----------------------
// ROUTES
// -----------------------
app.use("/api/analyze", analyzeRoutes);     // PDF/CSV → Subscription extraction
app.use("/api/plan", planRoutes);           // Free/Pro/Premium plan logic
app.use("/api/history", historyRoutes);     // User’s past scans
app.use("/api/settings", settingsRoutes);   // Password, profile, notifications
app.use("/api/stripe", stripeRoutes);       // Billing (subscriptions)

// -----------------------
// HEALTH CHECK
// -----------------------
app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "SubZen Backend Active",
    version: "1.0.0",
  });
});

// -----------------------
// START SERVER
// -----------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`🚀 Backend running on port ${PORT}`)
);