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
const { createGroup } = require("../controllers/groupController")

//For Admins
//getUser
router.route("/getUsers").get(getUsers)
//createUser
router.route("/createUser").post(createUser)
//toggleUserStatus (active/disabled)
router.route("/users/:username/toggle-status").put(toggleIsActive)
//updateUser (all fields)
router.route("/users/:username").put(updateUser)
//createGroup
router.route("/createGroup").post(createGroup)

//For Users
//updateUserEmail
router.route("/users/:username/email").put(updateUserEmail)
//updateUserPassword
router.route("/users/:username/password").put(updateUserPassword)

module.exports = router
