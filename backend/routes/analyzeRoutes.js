const express = require("express");
const router = express.Router();
const multer = require("multer"); 
const { analyzeStatement } = require("../controllers/analyzeController");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/analyze", upload.single("file"), analyzeStatement);

module.exports = router;