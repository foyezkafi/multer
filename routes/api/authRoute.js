const express = require("express")
const router = express.Router()
const authController = require("../../controllers/authController")
const authMiddleware = require("../../middleware/authMiddleware")

router.post("/registration", authController.registrationController)
router.post("/login", authController.loginController)
router.get("/verify-email", authController.verifyEmailController)
router.post("/verify-email", authController.verifyEmailController)
router.post("/resend-verification", authController.resendVerificationController)
router.post("/forgot-password", authController.forgotPasswordController)
router.get("/reset-password", authController.resetPasswordPageController)
router.post("/reset-password", express.urlencoded({ extended: true }), authController.resetPasswordController)
router.post("/refresh-token", authController.refreshTokenController)
router.post("/logout", authMiddleware, authController.logoutController)

module.exports = router
