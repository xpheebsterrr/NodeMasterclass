const express = require("express")
const app = express()
//cross-origin request sharing allows you to make requests to the server deployed at a different domain, eg. front end port to back end port
const cors = require("cors")
app.use(cors({ credentials: true }))
//secretive files for security
const dotenv = require("dotenv")
const cookieParser = require("cookie-parser")
app.use(cookieParser())
const db = require("./config/database")
const errorMiddleware = require("./middlewares/errors")
const ErrorHandler = require("./utils/errorHandler")
// const path = require("path")

//Setting up config.env file variables
dotenv.config({ path: "./config/config.env" })

// Attempt a test query to check if the database is connected
db.promise()
   .query("SELECT 1")
   .then(() => {
      console.log("Database connected successfully")
   })

//Handling uncalled exception (at the top so that it can handle all exceptions)
process.on("uncaughtException", err => {
   console.log(`Error: ${err.stack}`)
   console.log("Shutting down the server due to uncaught exception.")
   process.exit(1)
})

//Setting up body parser
app.use(express.json())

//Creating own midddleware, it is a function available everywhere in this proj and will run regardless iof req ran, sth like a global variable
const middleware = (req, res, next) => {
   console.log("Jiayouz u got this another day another slay.")
   //setting up user variable globally
   req.user = "Phoebe"
   req.requestMethod = req.method
   next()
}
app.use(middleware)

//Importing all routes
const routes = require("./routes/router")
//Mounting routes
app.use("/api/v1", routes)

//handle unhandled routes
app.all("*", (req, res, next) => {
   next(new ErrorHandler(`${req.originalUrl} route not found`, 404))
})

// app.use(express.static(path.join(__dirname, "client/build")))

// // Serve React app's index.html for any other requests
// app.get("*", (req, res) => {
//    res.sendFile(path.join(__dirname, "..", "PleaseWork", "src", "index.html"))
// })

// app.use(express.static(path.join(__dirname, "dist")))
// app.get("*", (req, res) => {
//    res.sendFile(path.join(__dirname, "dist", "index.html"))
// })

//Middleware to handle errors
app.use(errorMiddleware)

//seperate our dev and prod environment
const PORT = process.env.PORT
const server = app.listen(PORT, () => {
   console.log(
      `Server started on port ${process.env.PORT} in ${process.env.NODE_ENV} mode.`
   )
})

//Handling unhandled promise rejection
process.on("unhandledRejection", err => {
   console.log(`Error: ${err.message}`)
   console.log("Shutting down the server due to Unhandled promise rejection.")
   server.close(() => {
      process.exit(1)
   })
})

// // Generating JWT token
// const crypto = require("crypto")
// const secret = crypto.randomBytes(64).toString("hex")
// console.log("secret", secret) // This will be your JWT_SECRET
