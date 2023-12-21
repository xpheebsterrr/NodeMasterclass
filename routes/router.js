const express = require("express")
const router = express.Router()
//export methods
const {
    getUsers,
    createUser,
    toggleIsActive,
    updateUserEmail,
    updateUserPassword,
    updateUser,
    getUser
} = require("../controllers/userController")
const { createGroup, checkingGroup, getGroup } = require("../controllers/groupController")
const { protectedAdmin, isAuthenticated, isAuthorised } = require("../middlewares/protectedroutes")
const { loginUser, logoutUser } = require("../controllers/authController")
const {
    getApps,
    createApp,
    updateApp,
    createPlan,
    updatePlan,
    getPlans,
    getTasks,
    createTask,
    getApp,
    editTask,
    promoteTask,
    demoteTask,
    getAppPermit
} = require("../controllers/appController")

//Assignment 1
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
//getGroup
router.route("/getGroup").post(isAuthenticated, getGroup)

//For Users
//login User
router.route("/loginUser").post(loginUser)
//logout User
router.route("/logoutUser").post(isAuthenticated, logoutUser)
//updateUserEmail
router.route("/users/:username/email").put(isAuthenticated, updateUserEmail)
//updateUserPassword
router.route("/users/:username/password").put(isAuthenticated, updateUserPassword)
//getUser
router.route("/getUser").post(isAuthenticated, getUser)

//Specs
//Group functions
router.route("/checkGroup").post(isAuthenticated, checkingGroup)

//Assignment 2
//For Application
//get all App
router.route("/getApps").post(getApps)
//createApp
router.route("/createApp").post(createApp)
//updateApp
router.route("/updateApp").put(updateApp)
//get App
router.route("/getApp").post(getApp)
//get App Permit
router.route("/getAppPermit").post(getAppPermit)

//For Plans
//create plan
router.route("/createPlan").post(createPlan)
//update Plan
router.route("/updatePlan").put(updatePlan)
//get all plan
router.route("/getPlans").post(getPlans)

//For Tasks
//get all tasks
router.route("/getTasks").post(getTasks)
//create task
router.route("/createTask").post(isAuthenticated, createTask)
//edit task
router.route("/editTask").post(isAuthenticated, editTask)
//promote task
router.route("/promoteTask").post(isAuthenticated, promoteTask)
//demote task
router.route("/demoteTask").post(isAuthenticated, demoteTask)

module.exports = router
