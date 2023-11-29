//the auth controller will have all the methods for the auth router and we define all the routes defination in a separate method

const db = require("../config/database")
const catchAsyncErrors = require("../middlewares/catchAsyncErrors")
const ErrorHandler = require("../utils/errorHandler")

//connect database

//Register a new user => /api/v1/register
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
   try {
      const { name, email, password, groupname } = req.body

      // Insert a new user into the accounts table
      const result = await db
         .promise()
         .query(
            "INSERT INTO accounts (name, email, password, groupname) VALUES (?, ?, ?, ?)",
            [name, email, password, groupname]
         )

      // Retrieve the inserted user (optional, you can customize this part based on your needs)
      const insertedUserId = result[0].insertId
      const [user] = await db
         .promise()
         .query("SELECT * FROM accounts WHERE id = ?", [insertedUserId])

      //response
      res.status(200).json({
         success: true,
         message: "User is registered",
         data: user
      })
   } catch (error) {
      return next(
         new ErrorHandler(
            `Role (${req.user.group_list}) is not allowed to access this resource`,
            403
         )
      )
      next(error)
   }
})
