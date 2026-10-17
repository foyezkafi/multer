const nodemailer = require("nodemailer")
const { verifyEmailTemplate, resetPasswordTemplate } = require("../templates/emailTemplates")

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email credentials are missing. Set EMAIL_HOST, EMAIL_USER, and EMAIL_PASS in .env")
  }

  const transporter = createTransporter()
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"ERP System" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  })
}

const getApiBaseUrl = () => {
  const serverUrl = (process.env.SERVER_URL || `http://localhost:${process.env.PORT || 8000}`).replace(/\/$/, "")
  const baseUrl = process.env.BASE_URL || "/api/v1"
  return `${serverUrl}${baseUrl}`
}

const sendVerificationEmail = async ({ email, username, token }) => {
  const verifyUrl = `${getApiBaseUrl()}/auth/verify-email?token=${token}`
  await sendEmail({
    to: email,
    subject: "Verify your email",
    html: verifyEmailTemplate({ username, verifyUrl }),
  })
}

const sendResetPasswordEmail = async ({ email, username, token }) => {
  const frontendUrl = (process.env.CLIENT_URL || getApiBaseUrl()).replace(/\/$/, "")
  const resetUrl = process.env.CLIENT_URL
    ? `${frontendUrl}/reset-password?token=${token}`
    : `${getApiBaseUrl()}/auth/reset-password?token=${token}`

  await sendEmail({
    to: email,
    subject: "Reset your password",
    html: resetPasswordTemplate({ username, resetUrl }),
  })
}

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendResetPasswordEmail,
  getApiBaseUrl,
}
