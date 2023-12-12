//is this even used????????????????????????fyusafdiuwnaffd
const ErrorHandler = require("../utils/errorHandler")

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500

    if (process.env.NODE_ENV === "development") {
        res.status(err.statusCode).json({
            success: false,
            error: err,
            errMessage: err.message,
            stack: err.stack
        })
    }

    //in prod we only need to show users basic messages
    if (process.env.NODE_ENV === "production") {
        let error = { ...err }

        error.message = err.message

        // Handling JWT authentication error
        if (err.name === "UnauthorizedError") {
            // jwt authentication error
            return res.status(401).send({ message: "Invalid Token" })
        }

        // Handling Wrong JWT token error
        if (err.name === "JsonWebTokenError") {
            const message = "JSON Web token is invalid. Try Again!"
            error = new ErrorHandler(message, 500)
        }

        // Handling Expired JWT token error
        if (err.name === "TokenExpiredError") {
            const message = "JSON Web token is expired. Try Again!"
            error = new ErrorHandler(message, 500)
        }

        res.status(error.statusCode).json({
            success: false,
            message: error.message || "Internal Server Error."
        })
    }
}
