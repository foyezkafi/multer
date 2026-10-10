const userModel = require("../models/userSchema")
const bcrypt = require('bcrypt');

let registrationController = async (req, res) => {
    const {username, email, password, profilepicture, address, phone, gender, dob} = req.body
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isvalidEmail = emailRegex.test(email)
    const existingUser = await userModel.findOne({email: email})
    if(!username){
        res.status(400).json({
            succes: false,
            message: "please enter e username"
        })
    }
    if(username.length > 16){
          res.status(400).json({
            succes: false,
            message: "username max length will be 16"
        })
    }
    if(!email){
        res.status(400).json({
            succes: false,
            message: "please enter e email"
        })
    }
    if(existingUser){
        res.status(400).json({
            succes: false,
            message: "email already existed"
        })
    }
    if(!isvalidEmail){
          res.status(400).json({
            succes: false,
            message: "enter a valid email"
        })
    }
      if(!password){
        res.status(400).json({
            succes: false,
            message: "please enter e password"
        })
    }
    if(!gender){
           res.status(400).json({
            succes: false,
            message: "please select your gender"
        })
    }
    const user = await userModel.create({
        username, email, password, profilepicture, address, phone, gender, dob
    })

    res.status(200).json({
        succes: true,
        message: "Registration Successfully",
        data: {
            username, email
        }
    })
    
   
}
















let loginController = async (req, res) => {
    res.send("login route")
}

module.exports = {
    registrationController, 
    loginController
}