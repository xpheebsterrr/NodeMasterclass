//the auth controller will have all the methods for the auth router and we define all the routes defination in a separate method

const db = require("../config/database")
const catchAsyncErrors = require("../middlewares/catchAsyncErrors")
const ErrorHandler = require("../utils/errorHandler")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const dotenv = require("dotenv")
dotenv.config({ path: "./config/config.env" })

// // Generate token, call this after the user is authenticated
// const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
//    expiresIn: process.env.JWT_EXPIRES_IN
// })

//Login User => /api/v1/loginUser
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
   const { username, password } = req.body
   //Check if username and password is provided
   if (!username || !password) {
      return next(new ErrorHandler("Please provide username and password", 400))
   }
   //Find user in database
   const [rows] = await db
      .promise()
      .query("SELECT * FROM accounts WHERE username = ?", [username])
   const user = rows[0]
   if (!user) {
      return next(new ErrorHandler("Invalid username", 401))
   }
   //Check if password is correct
   const isMatch = await bcrypt.compare(password, user.password)
   if (!isMatch) {
      return next(new ErrorHandler("Incorrect password", 401))
   }
   //Create JWT token
   const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
   })
   // Set cookie options
   const cookieOptions = {
      expiresIn: new Date(
         Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
      ),
      httpOnly: true, // The cookie is not accessible to client-side scripts
      secure: req.secure || req.headers["x-forwarded-proto"] === "https", // Use secure flag on production
      sameSite: "strict" // Mitigate the risk of CSRF attack
   }
   //Send token in cookie
   res.cookie("jwt", token, cookieOptions),
      //remove password from output
      (user.password = undefined),
      res.status(200).json({
         success: true,
         message: "Logged in successfully",
         user,
         token
      })
})

exports.logoutUser = catchAsyncErrors(async (req, res, next) => {
   // Set cookie to none and expire it
   res.cookie("jwt", "none", {
      expiresIn: new Date(Date.now() + 10 * 1000), // Expire in 10 seconds
      httpOnly: true,
      secure: req.secure || req.headers["x-forwarded-proto"] === "https",
      sameSite: "strict"
   })

   res.status(200).json({
      success: true,
      message: "Logged out successfully"
   })
})
