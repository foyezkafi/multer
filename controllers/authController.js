const bcrypt = require("bcrypt")
const userModel = require("../models/userSchema")
const {
  createAuthTokens,
  generateRandomToken,
  hashToken,
  verifyRefreshToken,
} = require("../helpers/tokenHelper")
const { sendVerificationEmail, sendResetPasswordEmail } = require("../helpers/emailHelper")
const { verificationResultPage, resetPasswordPage } = require("../templates/emailTemplates")

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const VERIFICATION_EXPIRES_MS = 24 * 60 * 60 * 1000
const RESET_EXPIRES_MS = 15 * 60 * 1000

const sendSuccess = (res, status, message, data) => {
  return res.status(status).json({
    success: true,
    message,
    ...(data !== undefined ? { data } : {}),
  })
}

const sendError = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message,
  })
}

const wantsJson = (req) => {
  const accept = req.headers.accept || ""
  return accept.includes("application/json") || req.query.format === "json"
}

const setEmailVerificationToken = async (user) => {
  const token = generateRandomToken()
  user.emailVerificationToken = hashToken(token)
  user.emailVerificationExpires = new Date(Date.now() + VERIFICATION_EXPIRES_MS)
  await user.save()
  return token
}

const setPasswordResetToken = async (user) => {
  const token = generateRandomToken()
  user.passwordResetToken = hashToken(token)
  user.passwordResetExpires = new Date(Date.now() + RESET_EXPIRES_MS)
  await user.save()
  return token
}

const sanitizeUser = (user) => {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    profilepicture: user.profilepicture,
    address: user.address,
    phone: user.phone,
    gender: user.gender,
    dob: user.dob,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
  }
}

let registrationController = async (req, res) => {
  try {
    const { username, email, password, profilepicture, address, phone, gender, dob } = req.body

    if (!username) return sendError(res, 400, "Please enter a username")
    if (username.length > 16) return sendError(res, 400, "Username max length will be 16")
    if (!email) return sendError(res, 400, "Please enter an email")
    if (!emailRegex.test(email)) return sendError(res, 400, "Enter a valid email")
    if (!password) return sendError(res, 400, "Please enter a password")
    if (password.length < 6) return sendError(res, 400, "Password must be at least 6 characters")
    if (!gender) return sendError(res, 400, "Please select your gender")

    const existingUser = await userModel.findOne({ email: email.toLowerCase() })
    if (existingUser) return sendError(res, 400, "Email already existed")

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await userModel.create({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      profilepicture,
      address,
      phone,
      gender,
      dob,
      isEmailVerified: false,
    })

    const verificationToken = await setEmailVerificationToken(user)

    try {
      await sendVerificationEmail({
        email: user.email,
        username: user.username,
        token: verificationToken,
      })
    } catch (mailError) {
      console.error("Verification email failed:", mailError.message)
      return sendSuccess(res, 201, "Registration successful, but verification email could not be sent. Use resend verification.", {
        user: sanitizeUser(user),
      })
    }

    return sendSuccess(res, 201, "Registration successful. Please check your email to verify your account.", {
      user: sanitizeUser(user),
    })
  } catch (error) {
    console.error(error)
    return sendError(res, 500, "Registration failed")
  }
}

let loginController = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email) return sendError(res, 400, "Please enter an email")
    if (!password) return sendError(res, 400, "Please enter a password")

    const user = await userModel.findOne({ email: email.toLowerCase() }).select("+password +refreshToken")
    if (!user) return sendError(res, 400, "Invalid email or password")

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return sendError(res, 400, "Invalid email or password")

    if (!user.isEmailVerified) {
      return sendError(res, 403, "Please verify your email before logging in")
    }

    const tokens = createAuthTokens(user)
    user.refreshToken = tokens.refreshToken
    await user.save()

    return sendSuccess(res, 200, "Login successful", {
      user: sanitizeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    })
  } catch (error) {
    console.error(error)
    return sendError(res, 500, "Login failed")
  }
}

let verifyEmailController = async (req, res) => {
  try {
    const token = req.query.token || req.body.token
    if (!token) {
      if (wantsJson(req)) return sendError(res, 400, "Verification token is required")
      return res.status(400).send(verificationResultPage({
        success: false,
        message: "Verification token is required.",
      }))
    }

    const hashed = hashToken(token)
    const user = await userModel
      .findOne({
        emailVerificationToken: hashed,
        emailVerificationExpires: { $gt: new Date() },
      })
      .select("+emailVerificationToken +emailVerificationExpires")

    if (!user) {
      if (wantsJson(req)) return sendError(res, 400, "Invalid or expired verification token")
      return res.status(400).send(verificationResultPage({
        success: false,
        message: "This verification link is invalid or has expired. Please request a new one.",
      }))
    }

    user.isEmailVerified = true
    user.emailVerificationToken = undefined
    user.emailVerificationExpires = undefined
    await user.save()

    if (wantsJson(req)) {
      return sendSuccess(res, 200, "Email verified successfully. You can now log in.")
    }

    return res.send(verificationResultPage({
      success: true,
      message: "Your email has been verified successfully. You can now log in.",
    }))
  } catch (error) {
    console.error(error)
    if (wantsJson(req)) return sendError(res, 500, "Email verification failed")
    return res.status(500).send(verificationResultPage({
      success: false,
      message: "Email verification failed. Please try again.",
    }))
  }
}

let resendVerificationController = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return sendError(res, 400, "Please enter an email")

    const user = await userModel
      .findOne({ email: email.toLowerCase() })
      .select("+emailVerificationToken +emailVerificationExpires")

    if (!user) return sendError(res, 404, "User not found")
    if (user.isEmailVerified) return sendError(res, 400, "Email is already verified")

    const verificationToken = await setEmailVerificationToken(user)
    await sendVerificationEmail({
      email: user.email,
      username: user.username,
      token: verificationToken,
    })

    return sendSuccess(res, 200, "Verification email sent")
  } catch (error) {
    console.error(error)
    return sendError(res, 500, "Could not resend verification email. Check email credentials.")
  }
}

let forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return sendError(res, 400, "Please enter an email")

    const user = await userModel
      .findOne({ email: email.toLowerCase() })
      .select("+passwordResetToken +passwordResetExpires")

    if (!user) {
      return sendSuccess(res, 200, "If this email exists, a password reset link has been sent")
    }

    const resetToken = await setPasswordResetToken(user)

    try {
      await sendResetPasswordEmail({
        email: user.email,
        username: user.username,
        token: resetToken,
      })
    } catch (mailError) {
      console.error("Reset email failed:", mailError.message)
      return sendError(res, 500, "Could not send password reset email. Check email credentials.")
    }

    return sendSuccess(res, 200, "If this email exists, a password reset link has been sent")
  } catch (error) {
    console.error(error)
    return sendError(res, 500, "Forgot password failed")
  }
}

let resetPasswordPageController = async (req, res) => {
  const token = req.query.token
  if (!token) {
    return res.status(400).send(verificationResultPage({
      success: false,
      message: "Reset token is required.",
    }))
  }

  return res.send(resetPasswordPage({
    token,
    message: "Enter a new password for your account.",
  }))
}

let resetPasswordController = async (req, res) => {
  try {
    const token = req.body.token || req.query.token
    const { password } = req.body

    if (!token) return sendError(res, 400, "Reset token is required")
    if (!password) return sendError(res, 400, "Please enter a new password")
    if (password.length < 6) return sendError(res, 400, "Password must be at least 6 characters")

    const hashed = hashToken(token)
    const user = await userModel
      .findOne({
        passwordResetToken: hashed,
        passwordResetExpires: { $gt: new Date() },
      })
      .select("+password +passwordResetToken +passwordResetExpires +refreshToken")

    if (!user) return sendError(res, 400, "Invalid or expired reset token")

    user.password = await bcrypt.hash(password, 10)
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    user.refreshToken = undefined
    await user.save()

    if (!wantsJson(req) && req.headers["content-type"] && req.headers["content-type"].includes("application/x-www-form-urlencoded")) {
      return res.send(verificationResultPage({
        success: true,
        message: "Password reset successful. You can now log in with your new password.",
      }))
    }

    return sendSuccess(res, 200, "Password reset successful. Please log in with your new password.")
  } catch (error) {
    console.error(error)
    return sendError(res, 500, "Reset password failed")
  }
}

let refreshTokenController = async (req, res) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) return sendError(res, 400, "Refresh token is required")

    let decoded
    try {
      decoded = verifyRefreshToken(refreshToken)
    } catch (error) {
      return sendError(res, 401, "Invalid or expired refresh token")
    }

    const user = await userModel.findById(decoded.id).select("+refreshToken")
    if (!user || user.refreshToken !== refreshToken) {
      return sendError(res, 401, "Invalid refresh token")
    }

    const tokens = createAuthTokens(user)
    user.refreshToken = tokens.refreshToken
    await user.save()

    return sendSuccess(res, 200, "Token refreshed", {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    })
  } catch (error) {
    console.error(error)
    return sendError(res, 500, "Token refresh failed")
  }
}

let logoutController = async (req, res) => {
  try {
    await userModel.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } })
    return sendSuccess(res, 200, "Logout successful")
  } catch (error) {
    console.error(error)
    return sendError(res, 500, "Logout failed")
  }
}

module.exports = {
  registrationController,
  loginController,
  verifyEmailController,
  resendVerificationController,
  forgotPasswordController,
  resetPasswordPageController,
  resetPasswordController,
  refreshTokenController,
  logoutController,
}
