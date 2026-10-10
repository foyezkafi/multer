const express = require("express");
const router = express.Router(); 
const authController =  require("../../controllers/authController")
const upload = require ("../../middleware/filleUpload.js")



router.post("/login",(req, res)=>{
    console.log("ami login route")
} )
// router.post("/registration", upload.single('picture'), authController.registrationController)
router.post("/registration", authController.registrationController)


module.exports = router;