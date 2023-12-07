const express = require("express")
const router = express.Router()
//export methods
const {
   getUsers,
   createUser,
   toggleIsActive,
   updateUserEmail,
   updateUserPassword,
   updateUser
} = require("../controllers/userController")
const { createGroup, checkingGroup } = require("../controllers/groupController")
const { protectedAdmin, isAuthenticated, isAuthorised } = require("../middlewares/protectedroutes")
const { loginUser, logoutUser } = require("../controllers/authController")

//For Admins
//getUsers
router.route("/getUsers").post(isAuthenticated, isAuthorised("admin"), getUsers)
//createUser
router.route("/createUser").post(isAuthenticated, isAuthorised("admin"), createUser)
//toggleUserStatus (active/disabled)
router.route("/users/:username/toggle-status").put(isAuthenticated, isAuthorised("admin"), toggleIsActive)
//updateUser (all fields)
router.route("/users/:username").put(isAuthenticated, isAuthorised("admin"), protectedAdmin, updateUser)
//createGroup
router.route("/createGroup").post(isAuthenticated, isAuthorised("admin"), createGroup)

//For Users
//login User
router.route("/loginUser").post(loginUser)
//logout User
router.route("/logoutUser").post(isAuthenticated, logoutUser)
//updateUserEmail
router.route("/users/:username/email").put(isAuthenticated, updateUserEmail)
//updateUserPassword
router.route("/users/:username/password").put(isAuthenticated, updateUserPassword)

//Specs
//Group functions
router.route("/checkGroup").post(isAuthenticated, checkingGroup)

module.exports = router
