const userModel = require("../models/userSchema")
const { verifyAccessToken } = require("../helpers/tokenHelper")

const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      })
    }

    const token = header.split(" ")[1]
    const decoded = verifyAccessToken(token)
    const user = await userModel.findById(decoded.id).select("-password")

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    })
  }
}

module.exports = authMiddleware
