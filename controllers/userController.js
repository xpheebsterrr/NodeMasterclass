//the User controller will have all the methods for the jobs router and we define all the routes defination in a separate method

const ErrorHandler = require("../utils/errorHandler")
//later wrap the async functions
const catchAsyncErrors = require("../middlewares/catchAsyncErrors")

// Get all Jobs  =>  /api/v1/jobs (named as api for clarity)
exports.postUser = (req, res, next) => {
   const { username, email, password, groupname } = req.body
   // do something, query users
   const data = query(querystr, values)
   res.json({
      success: true,
      //can req anth we want to get (example of how to use middleware)
      middlewareUser: req.requestMethod,
      message: "This route will display all jobs in future.",
      data
   })
}
