const express = require("express");
const router = express.Router();
const multer = require("multer");
const { analyzeStatement } = require("../controllers/analyzeController");

// Multer config — store file in memory
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Analyze bank statement: PDF or CSV
 * Example:
 * POST /api/analyze-statement?plan=premium
 */
router.post("/analyze-statement", upload.single("file"), analyzeStatement);

module.exports = router;