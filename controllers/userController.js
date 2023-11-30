//the User controller will have all the methods for the jobs router and we define all the routes defination in a separate method

const ErrorHandler = require("../utils/errorHandler")
const catchAsyncErrors = require("../middlewares/catchAsyncErrors")
const db = require("../config/database")
const bcrypt = require("bcrypt")
const { hashPassword } = require("../utils/passwordUtils")
const saltRounds = 10 //number of salt rounds for bcrypt hashing

// Get all Users  =>  /api/v1/getUsers (named as api for clarity)
exports.getUsers = catchAsyncErrors(async (req, res, next) => {
   const data = await db.promise().query("SELECT * FROM accounts")
   res.json({
      success: true,
      message: "Retrieved ${data[0].length} users successfully",
      data: data[0]
   })
})

// Create User  =>  /api/v1/CreateUser
exports.createUser = catchAsyncErrors(async (req, res, next) => {
   const { username, password, email, groupname } = req.body
   //password complexity check
   const passwordRegex =
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&()])[A-Za-z\d@$!%*?&()]{8,10}$/
   if (!password.match(passwordRegex)) {
      return res.status(400).json({
         success: false,
         message:
            "Password must be 8-10 characters long and include alphabets, numbers, and special characters."
      })
   }
   // Hash the password
   const hashedPassword = await bcrypt.hash(password, saltRounds)
   // Insert a new user into the accounts table
   const result = await db
      .promise()
      .query(
         "INSERT INTO accounts (username, password, email, groupname) VALUES (?, ?, ?, ?)",
         [username, hashedPassword, email, groupname]
      )

   // Retrieve the newly created user
   const [user] = await db
      .promise()
      .query("SELECT * FROM accounts WHERE username = ?", [username])
   res.json({
      success: true,
      message: "User is created successfully",
      data: user[0]
   })
})

// Toggle User Status  =>  /api/v1/toggleIsActive
exports.toggleIsActive = catchAsyncErrors(async (req, res, next) => {
   const { username } = req.body
   // Get the current 'isActive' status for the user
   const [userData] = await db
      .promise()
      .query("SELECT isActive FROM accounts WHERE username = ?", [username])
   // Toggle the 'isActive' status
   const newStatus = userData[0].isActive === "active" ? "disabled" : "active"
   // Update the 'isActive' status for the user
   const result = await db
      .promise()
      .query("UPDATE accounts SET isActive = ? WHERE username = ?", [
         newStatus,
         username
      ])
   res.json({
      success: true,
      message: "User status toggled successfully",
      data: { username, isActive: newStatus }
   })
})

// Update User  =>  /api/v1/updateUser
exports.updateUser = catchAsyncErrors(async (req, res, next) => {
   const { username, email, password, groupname } = req.body
   // Password complexity check and hashing
   let hashedPassword
   if (password) {
      const passwordRegex =
         /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&()])[A-Za-z\d@$!%*?&()]{8,10}$/
      if (!password.match(passwordRegex)) {
         return res.status(400).json({
            success: false,
            message:
               "Password must be 8-10 characters long and include alphabets, numbers, and special characters."
         })
      }
      hashedPassword = await bcrypt.hash(password, saltRounds) // using bcrypt to hash the password
   }

   await db
      .promise()
      .query(
         "UPDATE accounts SET email = ?, password = ?, groupname = ? WHERE username = ?",
         [email, hashedPassword, groupname, username]
      )
   res.json({
      success: true,
      message: "User updated successfully",
      //avoid returning password info for secure coding
      data: { username, email, password, groupname }
   })
})

// Update user Email =>/api/v1/updateUserEmail
exports.updateUserEmail = catchAsyncErrors(async (req, res, next) => {
   const { username, email } = req.body
   const data = await db
      .promise()
      .query("UPDATE accounts SET email = ? WHERE username = ?", [
         email,
         username
      ])
   res.json({
      success: true,
      message: "Email updated successfully",
      data: { username, email }
   })
})

// Update user Password =>/api/v1/updateUserPassword
exports.updateUserPassword = catchAsyncErrors(async (req, res, next) => {
   const { username, password } = req.body
   let hashedPassword
   if (password) {
      const passwordRegex =
         /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&()])[A-Za-z\d@$!%*?&()]{8,10}$/
      if (!password.match(passwordRegex)) {
         return res.status(400).json({
            success: false,
            message:
               "Password must be 8-10 characters long and include alphabets, numbers, and special characters."
         })
      }
      hashedPassword = await bcrypt.hash(password, saltRounds)
   }
   await db
      .promise()
      .query("UPDATE accounts SET password = ? WHERE username = ?", [
         hashedPassword,
         username
      ])
   res.json({
      success: true,
      message: "Password updated successfully",
      data: { username, password }
   })
})
