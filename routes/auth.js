const express = require("express")
const router = express.Router()

//take method from controller
const { registerUser } = require("../controllers/authController")
const { checkGroup } = require("../controllers/groupController")

router.route("/register").post(registerUser)
router.route("/checkGroup").post(checkGroup)

module.exports = router
