// routes/historyRoutes.js

const express = require("express");
const router = express.Router();
const { getHistory } = require("../controllers/historyController");
const verifyAuth = require("../utils/verifyAuth");

// Protected route (requires auth token)
router.get("/", verifyAuth, getHistory);

module.exports = router;