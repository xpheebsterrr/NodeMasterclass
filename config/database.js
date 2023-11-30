const mysql = require("mysql2")
const dotenv = require("dotenv")
//Setting up config.env file variables
dotenv.config({ path: "./config/config.env" })

const db = mysql.createPool({
   host: process.env.DB_HOST,
   user: process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_DATABASE,
   connectionLimit: 10
})
//Event listener for pool errors
db.on("error", err => {
   console.error("MySQL Pool Error:", err)
})

module.exports = db
