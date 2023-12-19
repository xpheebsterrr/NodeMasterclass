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
    const {
        App_Acronym,
        App_Rnumber,
        App_startDate,
        App_endDate,
        App_Description,
        App_permit_Create,
        App_permit_Open,
        App_permit_toDoList,
        App_permit_Doing,
        App_permit_Done
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
            message: `App '${App_Acronym}' already exists`
        })
    }
    // Insert a new user into the accounts table
    await db
        .promise()
        .query(
            "INSERT INTO application (App_Acronym, App_Description, App_Rnumber, App_startDate, App_endDate, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done, App_permit_Create) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ? , ?)",
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

// Update App  =>  /api/v1/updateApp
exports.updateApp = catchAsyncErrors(async (req, res, next) => {
    const {
        App_Acronym,
        App_startDate,
        App_endDate,
        App_Description,
        App_permit_Create,
        App_permit_Open,
        App_permit_toDoList,
        App_permit_Doing,
        App_permit_Done
    } = req.body
    await db
        .promise()
        .query(
            "UPDATE application SET App_Description = ?, App_startDate = ?, App_endDate = ?, App_permit_Open = ?, App_permit_toDoList = ?, App_permit_Doing = ?, App_permit_Done = ?, App_permit_Create = ?  WHERE App_Acronym = ?",
            [
                App_Description,
                App_startDate,
                App_endDate,
                App_permit_Open,
                App_permit_toDoList,
                App_permit_Doing,
                App_permit_Done,
                App_permit_Create,
                App_Acronym
            ]
        )

    return res.json({
        success: true,
        message: "App updated successfully",
        data: {
            App_Acronym,
            App_Description,
            App_startDate,
            App_endDate,
            App_permit_Open,
            App_permit_toDoList,
            App_permit_Doing,
            App_permit_Done,
            App_permit_Create
        }
    })
})

// Create Plan  =>  /api/v1/CreatePlan
exports.createPlan = catchAsyncErrors(async (req, res, next) => {
    const { Plan_MVP_name, Plan_startDate, Plan_endDate, Plan_app_Acronym } = req.body
    //if no Plan name
    if (!Plan_MVP_name || Plan_MVP_name.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Plan name is required."
        })
    }
    // Insert a new plan into the plans table
    await db
        .promise()
        .query("INSERT INTO plan (Plan_MVP_name, Plan_startDate, Plan_endDate, Plan_app_Acronym) VALUES (?, ?, ?, ?)", [
            Plan_MVP_name,
            Plan_startDate,
            Plan_endDate,
            Plan_app_Acronym
        ])
    // Retrieve the newly created user
    const [plan] = await db.promise().query("SELECT * FROM plan WHERE Plan_app_Acronym = ?", [Plan_app_Acronym])
    res.json({
        success: true,
        message: "Plan is created successfully",
        data: plan[0]
    })
    return
})

// Update Plan  =>  /api/v1/updatePlan
exports.updatePlan = catchAsyncErrors(async (req, res, next) => {
    const { Plan_startDate, Plan_endDate, Plan_MVP_name, Plan_app_Acronym } = req.body
    const result = await db
        .promise()
        .query("UPDATE plan SET Plan_startDate = ?, Plan_endDate = ? WHERE Plan_MVP_name = ? AND Plan_app_Acronym = ?", [
            Plan_startDate,
            Plan_endDate,
            Plan_MVP_name,
            Plan_app_Acronym
        ])
    if (result[0].affectedRows === 0) {
        // No rows were updated (no matching records found)
        return res.status(404).json({
            success: false,
            message: "No matching records found for update"
        })
    }
    return res.json({
        success: true,
        message: "Plan updated successfully",
        data: {
            Plan_MVP_name,
            Plan_startDate,
            Plan_endDate,
            Plan_app_Acronym
        }
    })
})

// Get all Plans  =>  /api/v1/getPlans (named as api for clarity)
exports.getPlans = catchAsyncErrors(async (req, res, next) => {
    const { Plan_app_Acronym } = req.body
    const data = await db.promise().query("SELECT * FROM plan WHERE Plan_app_Acronym = ?", [Plan_app_Acronym])
    res.json({
        success: true,
        message: "Retrieved ${data[0].length} plans successfully",
        data: data[0]
    })
    return
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
