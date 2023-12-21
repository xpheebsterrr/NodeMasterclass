//the User controller will have all the methods for the jobs router and we define all the routes defination in a separate method

const ErrorHandler = require("../utils/errorHandler")
const catchAsyncErrors = require("../middlewares/catchAsyncErrors")
const db = require("../config/database")
const bcrypt = require("bcrypt")
const saltRounds = 10 //number of salt rounds for bcrypt hashing

// Get all Users  =>  /api/v1/getUsers (named as api for clarity)
exports.getUsers = catchAsyncErrors(async (req, res, next) => {
    const data = await db.promise().query("SELECT * FROM accounts")
    res.json({
        success: true,
        message: "Retrieved ${data[0].length} users successfully",
        data: data[0]
    })
    return
})

function parseJwt(token) {
    try {
        // Split the token into its parts
        const [header, payload, signature] = token.split(".")

        // Decode the payload
        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map(function (c) {
                    return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
                })
                .join("")
        )

        return JSON.parse(jsonPayload)
    } catch (e) {
        return null // Return null if token is invalid
    }
}

// Get one User  =>  /api/v1/getUser (named as api for clarity)
exports.getUser = catchAsyncErrors(async (req, res, next) => {
    const userData = parseJwt(req.body.access_token)
    const data = await db.promise().query("SELECT * FROM accounts WHERE username = ?", userData.username)
    res.json({
        success: true,
        message: "Retrieved user ${username} successfully",
        data: data[0][0]
    })
    return
})

// Create User  =>  /api/v1/CreateUser
exports.createUser = catchAsyncErrors(async (req, res, next) => {
    // const token = req.body.access_token // read the token from the cookie
    const { username, password, email, groupnames } = req.body
    //if no username
    if (!username || username.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Username is required."
        })
    }
    //password complexity check
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&()])[A-Za-z\d@$!%*?&()]{8,10}$/
    if (!password.match(passwordRegex)) {
        return res.status(400).json({
            success: false,
            message: "Password must be 8-10 characters long and include alphabets, numbers, and special characters."
        })
    }
    // Check if the username already exists
    const [existingUser] = await db.promise().query("SELECT * FROM accounts WHERE username = ?", [username])
    if (existingUser.length > 0) {
        return res.status(409).json({
            // 409 Conflict
            success: false,
            message: `Error: User '${username}' already exists`
        })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Insert a new user into the accounts table
    await db
        .promise()
        .query("INSERT INTO accounts (username, password, email, groupnames) VALUES (?, ?, ?, ?)", [
            username,
            hashedPassword,
            email,
            groupnames
        ])

    // Retrieve the newly created user
    const [user] = await db.promise().query("SELECT * FROM accounts WHERE username = ?", [username])
    res.json({
        success: true,
        message: "User is created successfully",
        data: user[0]
    })
    return
})

// Toggle User Status  =>  /api/v1/toggleIsActive
exports.toggleIsActive = catchAsyncErrors(async (req, res, next) => {
    const { username } = req.body
    // Get the current 'isActive' status for the user
    const [userData] = await db.promise().query("SELECT isActive FROM accounts WHERE username = ?", [username])
    // Toggle the 'isActive' status
    const newStatus = userData[0].isActive === "active" ? "disabled" : "active"
    // Update the 'isActive' status for the user
    const result = await db.promise().query("UPDATE accounts SET isActive = ? WHERE username = ?", [newStatus, username])
    return res.json({
        success: true,
        message: "User status toggled successfully",
        data: { username, isActive: newStatus }
    })
})

// Update User  =>  /api/v1/updateUser
exports.updateUser = catchAsyncErrors(async (req, res, next) => {
    const { username, email, password, groupnames, isActive } = req.body

    // Password complexity check and hashing
    let hashedPassword
    if (password) {
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&()])[A-Za-z\d@$!%*?&()]{8,10}$/
        if (!password.match(passwordRegex)) {
            return res.status(400).json({
                success: false,
                message: "Password must be 8-10 characters long and include alphabets, numbers, and special characters."
            })
        }
        hashedPassword = await bcrypt.hash(password, saltRounds) // using bcrypt to hash the password
        await db
            .promise()
            .query("UPDATE accounts SET email = ?, password = ?, groupnames = ?, isActive = ? WHERE username = ?", [
                email,
                hashedPassword,
                groupnames,
                isActive,
                username
            ])
    } else {
        await db
            .promise()
            .query("UPDATE accounts SET email = ?, groupnames = ?, isActive = ? WHERE username = ?", [
                email,
                groupnames,
                isActive,
                username
            ])
    }

    return res.json({
        success: true,
        message: "User updated successfully",
        //avoid returning password info for secure coding
        data: { username, email, groupnames, isActive }
    })
})

// Update user Email =>/api/v1/updateUserEmail
exports.updateUserEmail = catchAsyncErrors(async (req, res, next) => {
    const { username, email } = req.body
    const data = await db.promise().query("UPDATE accounts SET email = ? WHERE username = ?", [email, username])
    return res.json({
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
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&()])[A-Za-z\d@$!%*?&()]{8,10}$/
        if (!password.match(passwordRegex)) {
            return res.status(400).json({
                success: false,
                message: "Password must be 8-10 characters long and include alphabets, numbers, and special characters."
            })
        }
        hashedPassword = await bcrypt.hash(password, saltRounds)
    }
    await db.promise().query("UPDATE accounts SET password = ? WHERE username = ?", [hashedPassword, username])
    return res.json({
        success: true,
        message: "Password updated successfully",
        data: { username, password }
    })
})
