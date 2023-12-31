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
const {
   protectedAdmin,
   isAuthenticated,
   isAuthorised
} = require("../middlewares/protectedroutes")

//For Admins
//getUsers
router.route("/getUsers").get(isAuthenticated, isAuthorised("admin"), getUsers)
//createUser
router
   .route("/createUser")
   .post(isAuthenticated, isAuthorised("admin"), createUser)
//toggleUserStatus (active/disabled)
router
   .route("/users/:username/toggle-status")
   .put(isAuthenticated, isAuthorised("admin"), toggleIsActive)
//updateUser (all fields)
router
   .route("/users/:username")
   .put(isAuthenticated, isAuthorised("admin"), protectedAdmin, updateUser)
//createGroup
router
   .route("/createGroup")
   .post(isAuthenticated, isAuthorised("admin"), createGroup)

//For Users
//updateUserEmail
router.route("/users/:username/email").put(isAuthenticated, updateUserEmail)
//updateUserPassword
router
   .route("/users/:username/password")
   .put(isAuthenticated, updateUserPassword)

module.exports = router
