//the App controller will have all the methods for the app router and we define all the routes defination in a separate method
const ErrorHandler = require("../utils/errorHandler")
const catchAsyncErrors = require("../middlewares/catchAsyncErrors")
const db = require("../config/database")

// Get all App  =>  /api/v1/getApp (named as api for clarity)
exports.getApps = catchAsyncErrors(async (req, res, next) => {
    const data = await db.promise().query("SELECT * FROM application")
    res.json({
        success: true,
        message: "Retrieved ${data[0].length} apps successfully",
        data: data[0]
    })
    return
})

// Create App  =>  /api/v1/CreateApp
exports.createApp = catchAsyncErrors(async (req, res, next) => {
    // const token = req.body.access_token // read the token from the cookie
    const {
        App_Acronym,
        App_Description,
        App_Rnumber,
        App_startDate,
        App_endDate,
        App_permit_Open,
        App_permit_toDoList,
        App_permit_Doing,
        App_permit_Done,
        App_permit_Create
    } = req.body
    //if no App_Acronym
    if (!App_Acronym || App_Acronym.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "App Acronym is required."
        })
    }
    //if no App_Rnumber
    if (!App_Rnumber || App_Rnumber.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "App Rnumber is required."
        })
    }
    // Check if the App already exists
    const [existingApp] = await db.promise().query("SELECT * FROM application WHERE App_Acronym = ?", [App_Acronym])
    if (existingApp.length > 0) {
        return res.status(409).json({
            // 409 Conflict
            success: false,
            message: `Error: App '${existingApp}' already exists`
        })
    }
    // Insert a new user into the accounts table
    await db
        .promise()
        .query(
            "INSERT INTO application (App_Acronym, App_Description, App_Rnumber, App_startDate, App_endDate, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done, App_permit_Create) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ? ,?)",
            [
                App_Acronym,
                App_Description,
                App_Rnumber,
                App_startDate,
                App_endDate,
                App_permit_Open,
                App_permit_toDoList,
                App_permit_Doing,
                App_permit_Done,
                App_permit_Create
            ]
        )
    // Retrieve the newly created user
    const [app] = await db.promise().query("SELECT * FROM application WHERE App_Acronym = ?", [App_Acronym])
    res.json({
        success: true,
        message: "App is created successfully",
        data: app[0]
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
