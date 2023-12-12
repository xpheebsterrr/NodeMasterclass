const jwt = require("jsonwebtoken")
const catchAsyncErrors = require("./catchAsyncErrors")
const db = require("../config/database")
/** Returns true if JWT is valid */
//ensures that user is logged in
exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    //check for cookie called access_token to grant access to controller
    const token = req.body.access_token // read the token from the cookie
    console.log("isAuthenticated", token)
    if (token == null) {
        return res.sendStatus(401) // if there isn't any token
    }
    try {
        const data = jwt.verify(token, process.env.JWT_SECRET)
        req.username = data.username
        const result = await db.promise().query("SELECT * FROM accounts WHERE username = ?", [req.username])
        req.userDetails = result[0][0]
        //   if (req.userDetails.isActive === "disabled") {
        //       return res.sendStatus(401) //user is disabled
        //   }
        // req.groupnames = data.groupnames
        return next() // pass the execution off to whatever request the client intended
    } catch (e) {
        console.log("authentication error", e)
        return res.sendStatus(403) // if the token has expired or is invalid
    }
})

//ensures user had the valid permissions of the user group
exports.isAuthorised = (...groups) => {
    return (req, res, next) => {
        const { groupnames } = req.userDetails
        const requiredGroup = new Set(groups)
        let isAuthorised = false
        //User can be in multiple groups eg. user,admin,dev (string) hence we need to split them into an array
        if (groupnames) {
            const userGroups = groupnames.split(",")
            //if any of user's group is in the req role, user authorised
            isAuthorised = userGroups.some(group => requiredGroup.has(group))
            if (isAuthorised) {
                console.log("isAuthorised")
                //user is authorized, continue to next middleware
                next()
                return
            } else {
                res.json({
                    success: false,
                    message: "Error: User is not authorised."
                })
                return
            }
        } else {
            //if groupnames not provided in req
            res.json({
                success: false,
                message: "Error: missing groupname in req body."
            })
            return
        }
    }
}

//ensures that admins cannot edit admins
exports.protectedAdmin = async (req, res, next) => {
    const { username, groupnames } = req.userDetails
    console.log(req.body)
    if (
        groupnames.includes("admin") && // requestor is in admin group
        username != "admin" && // requestor is not super admin
        username != req.body.username && // requestor is not updating himself
        req.body.oldGroupnames.includes("admin") // requestor is trying to update another admin
    ) {
        res.json({
            success: false,
            message: "Error: Admins cannot update other admins."
        })
        return
    } else {
        next()
    }
}

//ensures that disabled users get kicked out
// exports.isActive = async (req, res, next) => {
//    const { groupnames } = req.userDetails
//    if (groupnames === "admin" && req.user.username != "admin") {
//        res.json({
//            success: false,
//            message: "Error: Admin is not editable."
//        })
//        return
//    } else {
//        next()
//    }
// }
