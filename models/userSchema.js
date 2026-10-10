const mongoose = require("mongoose")
const { required } = require("nodemon/lib/config")
const {Schema} = mongoose

const userSchema = new Schema ({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        required:true
    }, 
    password: {
        type: String,
        trim: true,
        required:true
    },
    profilepicture: {
        type: String,
    },
    address: {
        type: String,
    },
    phone: {
        type: String,
    },
    gender: {
        type: String,
        enum: ["male","female","others"]
    },
    dob: {
        type: String,
    }

},
{timestamps: true})


const userModel = mongoose.model("users", userSchema)

module.exports = userModel