const mysql = require("mysql2")

const db = mysql.createPool({
   host: process.env.DB_HOST,
   user: process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_DATABASE,
   connectionLimit: 10
})
if (db)
   console.log(`MySQL Database connected with host: ${process.env.DB_HOST}`)
//Event listener for pool errors
db.on("error", err => {
   console.error("MySQL Pool Error:", err)
})

module.exports = db

//example query from sql
// pool.query(`select * from registration`, (err, result, fields) => {
//    if (err) {
//       return console.log(err)
//    }
//    return console.log(result)
// })
