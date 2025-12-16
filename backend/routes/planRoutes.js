// backend/routes/planRoutes.js
const express = require("express");
const router = express.Router();

const verifyAuth = require("../utils/verifyAuth");
const {
  updatePlan,
  getPlanStatus,
} = require("../controllers/planController");

// Get current plan
router.get("/", verifyAuth, getPlanStatus);

// Update plan (Pro or Premium)
router.post("/update", verifyAuth, updatePlan);

module.exports = router;