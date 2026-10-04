

let registrationController = async (req, res) => {
    res.send("registration route")
}
let loginController = async (req, res) => {
    res.send("login route")
}

module.exports = {
    registrationController, 
    loginController
}