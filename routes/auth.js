const express = require("express")
const router = express.Router()

//take method from controller
const { loginUser, logoutUser } = require("../controllers/authController")
const { checkGroup } = require("../controllers/groupController")
const { isAuthenticated } = require("../middlewares/protectedroutes")

//Authentication methods
//login User
router.route("/loginUser").get(loginUser)
//logout User
router.route("/logoutUser").get(logoutUser)

//Group functions
router.route("/checkGroup").post(isAuthenticated, checkGroup)

module.exports = router
