//the User controller will have all the methods for the groups router and we define all the routes defination in a separate method
const catchAsyncErrors = require("../middlewares/catchAsyncErrors")
const db = require("../config/database")

//Checkgroup function that returns a value to indicate if a user is in the group =>  /api/v1/checkGroup
async function checkGroup(userid, groupname) {
   //If a matching row is found, 1 is returned; if not, the query returns an empty result set.
   const [result] = await db.promise().query("SELECT groupnames FROM accounts WHERE username = ?", [userid])
   // Check if the result is not empty and has groupnames
   if (result.length > 0 && result[0].groupnames) {
      result[0].groupnames = result[0].groupnames.split(",")
      // Check if groupnames include the specified groupname
      return result[0].groupnames.includes(groupname)
   } else {
      // Return false if result is empty or doesn't have groupnames
      return false
   }
}

// Exposes Checkgroup to route Checkgroup
exports.checkingGroup = async (req, res) => {
   //    const { username, groupnames } = req.body
   const username = req.username
   const group = req.body.groupnames
   try {
      const result = await checkGroup(username, group)
      // Return successful check
      return res.status(200).json({
         result: result,
         success: true,
         message: `User ${username} is ${group}`
      })
   } catch (e) {
      res.status(500).json({
         success: false,
         message: e
      })
      return
   }
}

//Function that creates a group =>  /api/v1/createGroup
exports.createGroup = catchAsyncErrors(async (req, res, next) => {
   const { groupnames } = req.body
   await db.promise().query("INSERT INTO `groups` (groupnames) VALUES (?)", [groupnames])
   res.json({
      success: true,
      message: "Group created successfully",
      data: { groupnames }
   })
})
