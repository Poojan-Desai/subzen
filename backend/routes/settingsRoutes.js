// routes/settingsRoutes.js

const express = require("express");
const router = express.Router();
const verifyAuth = require("../utils/verifyAuth");

const {
  updateName,
  updateNotifications,
  deleteAccount
} = require("../controllers/settingsController");

// All routes require a valid token
router.put("/name", verifyAuth, updateName);
router.put("/notifications", verifyAuth, updateNotifications);
router.delete("/delete", verifyAuth, deleteAccount);

module.exports = router;