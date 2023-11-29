//the User controller will have all the methods for the jobs router and we define all the routes defination in a separate method

const ErrorHandler = require("../utils/errorHandler")
//later wrap the async functions
const catchAsyncErrors = require("../middlewares/catchAsyncErrors")

// Get all Users  =>  /api/v1/getUsers (named as api for clarity)
exports.getUsers = catchAsyncErrors(async (req, res, next) => {
   const data = await db.promise().query("SELECT * FROM accounts")
   res.json({
      success: true,
      message: "Retrieved ${data[0].length} users successfully",
      data: data[0]
   })
})
