const express = require("express");
const router = express.Router(); 



router.post("/create",(req, res)=>{
    console.log("product create")
} )
router.post("/delete",(req, res)=>{
    console.log("product delete")
} )


module.exports = router;