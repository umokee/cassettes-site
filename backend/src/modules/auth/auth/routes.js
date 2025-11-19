const express = require("express");
const router = express.Router();
const authController = require("./controller");
const authMiddleware = require("../middleware");

router.post("/login", authController.login);

router.use(authMiddleware);

router.get("/me", authController.getCurrentUser);
router.post("/logout", authController.logout);
router.patch("/profile", authController.updateProfile);
router.post("/change-password", authController.changePassword);
router.get("/statistics", authController.getStatistics);
router.get("/activity-logs", authController.getActivityLogs);

module.exports = router;
