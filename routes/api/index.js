const express = require("express");
const router = express.Router();

const test = require("./test.js")
const authRoute = require ("./authRoute.js")
const productRoute = require("./productRoute.js")

router.use("/test", test);
router.use("/auth", authRoute)
router.use("/product", productRoute)

module.exports = router;   