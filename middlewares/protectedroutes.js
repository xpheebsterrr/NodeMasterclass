/** Returns true if JWT is valid */
//ensures that user is logged in
exports.isAuthenticated = (req, res, next) => {
   //check for cookie called access_token to grant access to controller
   const token = req.cookies.access_token // read the token from the cookie
   if (token == null) {
      return res.sendStatus(401) // if there isn't any token
   }
   try {
      const data = jwt.verify(token, process.env.JWT_SECRET)
      req.username = data.username
      // req.groupnames = data.groupnames
      return next() // pass the execution off to whatever request the client intended
   } catch {
      return res.sendStatus(403) // if the token has expired or is invalid
   }
}

//ensures user had the valid permissions of the user group
exports.isAuthorised = (...groups) => {
   return (req, res, next) => {
      const { groupnames } = req.body
      const requiredGroup = new Set(groups)
      let isAuthorised = false
      //User can be in multiple groups eg. user,admin,dev (string) hence we need to split them into an array
      if (groupnames) {
         const userGroups = groupnames.split(",")
         //if any of user's group is in the req role, user authorised
         isAuthorised = userGroups.some(group => requiredGroup.has(group))
         if (isAuthorised) {
            //user is authorized, continue to next middleware
            next()
         } else {
            res.json({
               success: false,
               message: "Error: User is not authorised."
            })
         }
      } else {
         //if groupnames not provided in req
         res.json({
            success: false,
            message: "Error: missing groupname in req body."
         })
         return
      }
      next()
   }
}

//ensures that admins cannot edit admins
exports.protectedAdmin = async (req, res, next) => {
   const { groupnames } = req.body
   if (groupnames === "admin" && req.user.username != "admin") {
      res.json({
         success: false,
         message: "Error: Admin is not editable."
      })
      return
   } else {
      next()
   }
}
