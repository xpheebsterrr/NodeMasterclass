const express = require("express")
const router = express.Router()
//export methods
const { getUsers } = require("../controllers/userController")
//export authentication
//qwerty

//getUser
router.route("/getUsers").get(getUsers)
//getUserUsername
//getUserEmail
//toggleUserStatus
//updateUserGroup
//updateUserEmail
//updateUserPassword

module.exports = router
