//the jobs controller will have all the methods for the jobs router and we define all the routes defination in a separate method
//this is the job example

const ErrorHandler = require("../utils/errorHandler")
//later wrap the async functions
const catchAsyncErrors = require("../middlewares/catchAsyncErrors")

// Get all Jobs  =>  /api/v1/jobs (named as api for clarity)
exports.getJobs = (req, res, next) => {
   res.status(200).json({
      success: true,
      //can req anth we want to get (example of how to use middleware)
      middlewareUser: req.requestMethod,
      message: "This route will display all jobs in future."
   })
}
