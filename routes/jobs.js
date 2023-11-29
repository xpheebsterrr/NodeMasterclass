const express = require("express")
const router = express.Router()

//Importing jobs controller methods
const { getJobs } = require("../controllers/jobsController")
router.route("/jobs").get(getJobs)
const { postUsers } = require("../controllers/jobsController")
router.route("/api/v1/register").post(getUsers)
router.route("/jobs").get(getJobs)
router.route("/jobs").get(getJobs)

module.exports = router
