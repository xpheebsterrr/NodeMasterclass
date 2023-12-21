//the App controller will have all the methods for the app router and we define all the routes defination in a separate method
const ErrorHandler = require("../utils/errorHandler")
const catchAsyncErrors = require("../middlewares/catchAsyncErrors")
const db = require("../config/database")
const jwt = require("jsonwebtoken")
const { checkGroup } = require("./groupController")

// Get all App  =>  /api/v1/getApp (named as api for clarity)
exports.getApps = catchAsyncErrors(async (req, res, next) => {
    const data = await db.promise().query("SELECT * FROM application")
    res.json({
        success: true,
        message: `Retrieved ${data[0].length} apps successfully`,
        data: data[0]
    })
    return
})

// Get App  =>  /api/v1/getApp (named as api for clarity)
exports.getApp = catchAsyncErrors(async (req, res, next) => {
    const { App_Acronym } = req.body
    const data = await db.promise().query("SELECT * FROM application WHERE App_Acronym = ?", [App_Acronym])
    res.json({
        success: true,
        message: `Retrieved app successfully`,
        data: data[0][0]
    })
    return
})

// Get App Permit  =>  /api/v1/getAppPermit
exports.getAppPermit = catchAsyncErrors(async (req, res, next) => {
    const { Task_app_Acronym, Task_state } = req.body
    //permission switch case
    let appPermit
    switch (Task_state) {
        case "create":
            appPermit = "App_permit_Create"
            break
        case "open":
            appPermit = "App_permit_Open"
            break
        case "todo":
            appPermit = "App_permit_toDoList"
            break
        case "doing":
            appPermit = "App_permit_Doing"
            break
        case "done":
            appPermit = "App_permit_Done"
            break
        case "closed":
            return res.json({
                unauth: "role"
            })
        // default:
        //     return res.json({
        //         error: "Internal Server Error"
        //     })
    }
    //find the user group with permission
    const statePermit = await db.promise().query(`SELECT ${appPermit} FROM application WHERE App_Acronym = ?`, [Task_app_Acronym])
    return res.json({
        success: true,
        message: "Retrieved app successfully",
        data: statePermit[0][0][appPermit]
    })
})

// Create App  =>  /api/v1/createApp
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
            message: `App Acronym is required.`
        })
    }
    //if no App_Rnumber
    if (!App_Rnumber || App_Rnumber.trim() === "") {
        return res.status(400).json({
            success: false,
            message: `App Rnumber is required.`
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
    return res.json({
        success: true,
        message: `App is created successfully`,
        data: app[0]
    })
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
        message: `App updated successfully`,
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
            message: `Plan name is required.`
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
    return res.json({
        success: true,
        message: `Plan is created successfully`,
        data: plan[0]
    })
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
            message: `No matching records found for update`
        })
    }
    return res.json({
        success: true,
        message: `Plan updated successfully`,
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
    return res.json({
        success: true,
        message: `Retrieved ${data[0].length} plans successfully`,
        data: data[0]
    })
})

//For Tasks
// Get all Tasks  =>  /api/v1/getTasks (named as api for clarity)
exports.getTasks = catchAsyncErrors(async (req, res, next) => {
    const { Task_state, Task_app_Acronym } = req.body
    if (Task_state === "all") {
        const data = await db.promise().query("SELECT * FROM task WHERE Task_app_Acronym = ?", [Task_app_Acronym])
        res.json({
            success: true,
            message: `Retrieved ${data[0].length} tasks in ${Task_state} states from ${Task_app_Acronym} successfully`,
            data: data[0]
        })
    } else {
        const data = await db
            .promise()
            .query("SELECT * FROM task WHERE Task_state = ? AND Task_app_Acronym = ?", [Task_state, Task_app_Acronym])
        res.json({
            success: true,
            message: `Retrieved ${data[0].length} tasks in ${Task_state} state from ${Task_app_Acronym} successfully`,
            data: data[0]
        })
    }
    return
})
// Create Task  =>  /api/v1/CreateTask
exports.createTask = catchAsyncErrors(async (req, res, next) => {
    const { Task_name, Task_app_Acronym, Task_id, Task_description } = req.body
    //if no Task name
    if (!Task_name || Task_name.trim() === "") {
        return res.status(400).json({
            success: false,
            message: `Task name is required.`
        })
    }
    //add createDate
    function getCurrentDate() {
        const now = new Date()
        const day = String(now.getDate()).padStart(2, "0") //Get the day and pad with '0' if single digit
        const month = String(now.getMonth() + 1).padStart(2, "0") //Get the month (months are 0-based) and pad
        const year = now.getFullYear() //Get the full year
        return `${day}-${month}-${year}`
    }
    const currentDate = getCurrentDate()
    //Get current Date + Time
    function getCurrentDateTime() {
        const now = new Date()

        const day = String(now.getDate()).padStart(2, "0") // Get the day and pad with '0' if single digit
        const month = String(now.getMonth() + 1).padStart(2, "0") // Get the month (months are 0-based) and pad
        const year = now.getFullYear() // Get the full year

        const hours = String(now.getHours()).padStart(2, "0") // Get the hours and pad with '0' if single digit
        const minutes = String(now.getMinutes()).padStart(2, "0") // Get the minutes and pad
        const seconds = String(now.getSeconds()).padStart(2, "0") // Get the seconds and pad

        return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`
    }

    const currentDateTime = getCurrentDateTime()

    //add Task_creator n owner (user)
    const Task_owner = req.username
    //State -> open state (hardcorded for createTask)
    //createNote -> Task Created
    const taskNotes = "[" + currentDateTime + "] " + Task_owner + " (open): Task is created"

    // Insert a new task into the task table
    await db
        .promise()
        .query(
            "INSERT INTO task (Task_name, Task_app_Acronym, Task_id, Task_description, Task_notes, Task_state, Task_creator, Task_owner, Task_createDate ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [Task_name, Task_app_Acronym, Task_id, Task_description, taskNotes, "open", Task_owner, Task_owner, currentDate]
        )
    //Increment r number
    await db.promise().query("UPDATE application SET App_Rnumber = App_Rnumber + 1 WHERE App_Acronym = ?", [Task_app_Acronym])
    // Retrieve the newly created task
    const [task] = await db.promise().query("SELECT * FROM task WHERE Task_id = ?", [Task_id])
    res.json({
        success: true,
        message: `Task is created successfully`,
        data: task[0]
    })
    return
})

//Edit Tasks =>  /api/v1/editTask (add note and plan)
exports.editTask = catchAsyncErrors(async (req, res, next) => {
    const { Task_plan, Task_notes, Task_id, Task_state, Task_name } = req.body
    const Task_owner = req.username
    //Get current Date + Time
    function getCurrentDateTime() {
        const now = new Date()

        const day = String(now.getDate()).padStart(2, "0") // Get the day and pad with '0' if single digit
        const month = String(now.getMonth() + 1).padStart(2, "0") // Get the month (months are 0-based) and pad
        const year = now.getFullYear() // Get the full year

        const hours = String(now.getHours()).padStart(2, "0") // Get the hours and pad with '0' if single digit
        const minutes = String(now.getMinutes()).padStart(2, "0") // Get the minutes and pad
        const seconds = String(now.getSeconds()).padStart(2, "0") // Get the seconds and pad

        return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`
    }
    const currentDateTime = getCurrentDateTime()

    // Fetch the previous notes from the database
    const [previousNotes] = await db.promise().query("SELECT Task_notes FROM task WHERE Task_id = ?", [Task_id])
    const previousNote = previousNotes[0].Task_notes || "" // Retrieve the previous notes
    // Concatenate the new note with the previous notes on a new line
    // const newNote = `[${currentDateTime}] ${Task_owner} (${Task_state}) ${Task_notes}\n${previousNote}`
    // Check if Task_notes is not empty before creating the new note
    const newNote = `[${currentDateTime}] ${Task_owner} (${Task_state}): ${
        Task_notes ? Task_notes : "Edited Task"
    }\n${previousNote}`

    // const newNote = "[" + currentDateTime + "] " + Task_owner + " (" + Task_state + ") " + Task_notes
    const result = await db
        .promise()
        .query("UPDATE task SET Task_plan = ?, Task_notes = ?, Task_owner = ? WHERE Task_id = ?", [
            Task_plan,
            newNote,
            Task_owner,
            Task_id
        ])
    if (result[0].affectedRows === 0) {
        // No rows were updated (no matching records found)
        return res.status(404).json({
            success: false,
            message: `No edits are made`
        })
    }
    return res.json({
        success: true,
        message: `Task updated successfully`,
        data: {
            Task_plan,
            Task_notes: newNote,
            Task_id,
            Task_owner,
            Task_state,
            Task_name
        }
    })
})

//Promote Tasks =>  /api/v1/promoteTask (add note and plan)
exports.promoteTask = catchAsyncErrors(async (req, res, next) => {
    const { Task_plan, Task_notes, Task_id, Task_state, Task_name, Task_app_Acronym } = req.body
    const Task_owner = req.username
    // const Task_owner_groupname = req.groupnames

    //permission switch case
    let newState
    let appPermit
    switch (Task_state) {
        case "open":
            newState = "todo"
            appPermit = "App_permit_Open"
            break
        case "todo":
            newState = "doing"
            appPermit = "App_permit_toDoList"
            break
        case "doing":
            newState = "done"
            appPermit = "App_permit_Doing"
            break
        case "done":
            newState = "closed"
            appPermit = "App_permit_Done"
            break
        case "closed":
            return res.json({
                unauth: "role"
            })
        default:
            return res.json({
                error: "Internal Server Error"
            })
    }
    //find the user group with permission
    const statePermit = await db.promise().query(`SELECT ${appPermit} FROM application WHERE App_Acronym = ?`, [Task_app_Acronym])
    //check if user role matches app permits
    const auth = await checkGroup(Task_owner, statePermit[0][0][appPermit])
    if (!auth) {
        return res.json({
            success: false,
            unauth: "role",
            message: `Failed to promote task`
        })
    }
    //comeback

    //Creating note
    //Get current Date + Time
    function getCurrentDateTime() {
        const now = new Date()
        const day = String(now.getDate()).padStart(2, "0") // Get the day and pad with '0' if single digit
        const month = String(now.getMonth() + 1).padStart(2, "0") // Get the month (months are 0-based) and pad
        const year = now.getFullYear() // Get the full year
        const hours = String(now.getHours()).padStart(2, "0") // Get the hours and pad with '0' if single digit
        const minutes = String(now.getMinutes()).padStart(2, "0") // Get the minutes and pad
        const seconds = String(now.getSeconds()).padStart(2, "0") // Get the seconds and pad
        return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`
    }
    const currentDateTime = getCurrentDateTime()
    // Fetch the previous notes from the database
    const [previousNotes] = await db.promise().query("SELECT Task_notes FROM task WHERE Task_id = ?", [Task_id])
    const previousNote = previousNotes[0].Task_notes || "" // Retrieve the previous notes
    // Concatenate the new note with the previous notes on a new line
    // Check if Task_notes is not empty before creating the new note
    const newNote = `[${currentDateTime}] ${Task_owner} (${Task_state}): ${
        Task_notes ? Task_notes : "Promoted Task"
    }\n${previousNote}`

    const result = await db
        .promise()
        .query("UPDATE task SET Task_plan = ?, Task_notes = ?, Task_owner = ?, Task_state =? WHERE Task_id = ?", [
            Task_plan,
            newNote,
            Task_owner,
            newState,
            Task_id
        ])
    if (result[0].affectedRows === 0) {
        // No rows were updated (no matching records found)
        return res.status(404).json({
            success: false,
            message: `No edits are made`
        })
    }
    return res.json({
        success: true,
        message: `Task promoted successfully`,
        data: {
            Task_plan,
            Task_notes: newNote,
            Task_id,
            Task_owner,
            Task_state: newState,
            Task_name
        }
    })
})

//Demote Tasks =>  /api/v1/demoteTask (add note and plan)
//Reject Tasks =>
exports.demoteTask = catchAsyncErrors(async (req, res, next) => {
    const { Task_plan, Task_notes, Task_id, Task_state, Task_name, Task_app_Acronym } = req.body
    const Task_owner = req.username

    //permission switch case
    let newState
    let appPermit
    switch (Task_state) {
        case "open":
            return res.json({
                unauth: "role"
            })
        case "todo":
            newState = "open"
            appPermit = "App_permit_toDoList"
            break
        case "doing":
            newState = "todo"
            appPermit = "App_permit_Doing"
            break
        case "done":
            newState = "doing"
            appPermit = "App_permit_Done"
            break
        case "closed":
            newState = "done"
            appPermit = "App_permit_Done"
            break
        default:
            return res.json({
                error: "Internal Server Error"
            })
    }
    //find the user group with permission
    const statePermit = await db.promise().query(`SELECT ${appPermit} FROM application WHERE App_Acronym = ?`, [Task_app_Acronym])
    //check if user role matches app permits
    const auth = await checkGroup(Task_owner, statePermit[0][0][appPermit])
    if (!auth) {
        return res.json({
            success: false,
            unauth: "role",
            message: `Failed to promote task`
        })
    }
    //comeback

    //Creating note
    //Get current Date + Time
    function getCurrentDateTime() {
        const now = new Date()
        const day = String(now.getDate()).padStart(2, "0") // Get the day and pad with '0' if single digit
        const month = String(now.getMonth() + 1).padStart(2, "0") // Get the month (months are 0-based) and pad
        const year = now.getFullYear() // Get the full year
        const hours = String(now.getHours()).padStart(2, "0") // Get the hours and pad with '0' if single digit
        const minutes = String(now.getMinutes()).padStart(2, "0") // Get the minutes and pad
        const seconds = String(now.getSeconds()).padStart(2, "0") // Get the seconds and pad
        return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`
    }
    const currentDateTime = getCurrentDateTime()
    // Fetch the previous notes from the database
    const [previousNotes] = await db.promise().query("SELECT Task_notes FROM task WHERE Task_id = ?", [Task_id])
    const previousNote = previousNotes[0].Task_notes || "" // Retrieve the previous notes
    // Concatenate the new note with the previous notes on a new line
    // Check if Task_notes is not empty before creating the new note
    const newNote = `[${currentDateTime}] ${Task_owner} (${Task_state}): ${
        Task_notes ? Task_notes : "Demoted Task"
    }\n${previousNote}`

    const result = await db
        .promise()
        .query("UPDATE task SET Task_plan = ?, Task_notes = ?, Task_owner = ?, Task_state =? WHERE Task_id = ?", [
            Task_plan,
            newNote,
            Task_owner,
            newState,
            Task_id
        ])
    if (result[0].affectedRows === 0) {
        // No rows were updated (no matching records found)
        return res.status(404).json({
            success: false,
            message: `No edits are made`
        })
    }
    return res.json({
        success: true,
        message: `Task demoted successfully`,
        data: {
            Task_plan,
            Task_notes: newNote,
            Task_id,
            Task_owner,
            Task_state: newState,
            Task_name
        }
    })
})

// Update user Email =>/api/v1/updateUserEmail
exports.updateUserEmail = catchAsyncErrors(async (req, res, next) => {
    const { username, email } = req.body
    const data = await db.promise().query("UPDATE accounts SET email = ? WHERE username = ?", [email, username])
    return res.json({
        success: true,
        message: `Email updated successfully`,
        data: { username, email }
    })
})
