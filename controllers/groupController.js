//the User controller will have all the methods for the groups router and we define all the routes defination in a separate method
const catchAsyncErrors = require("../middlewares/catchAsyncErrors")
const db = require("../config/database")

//Checkgroup function that returns a value to indicate if a user is in a group
exports.checkGroup = catchAsyncErrors(async (req, res, next) => {
   const { username, groupname } = req.body
   //If a matching row is found, 1 is returned; if not, the query returns an empty result set.
   const [result] = await db
      .promise()
      .query("SELECT 1 FROM accounts WHERE username = ? AND groupname = ?", [
         username,
         groupname
      ])
   //if user is in group isUserInGroup = true
   const isUserInGroup = result.length > 0
   //returns boolean value
   res.json({
      success: true,
      message: `User ${username} is ${
         isUserInGroup ? "" : "not "
      }a ${groupname}`,
      isUserInGroup
   })
})
