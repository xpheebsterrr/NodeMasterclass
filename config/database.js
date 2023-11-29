const { createPool } = require("mysql2")

const pool = createPool({
   host: process.env.DB_HOST,
   user: process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_DATABASE,
   connectionLimit: 10
})
//Event listener for pool errors
pool.on("error", err => {
   console.error("MySQL Pool Error:", err)
})

module.exports = pool

//example query from sql
pool.query(`select * from registration`, (err, result, fields) => {
   if (err) {
      return console.log(err)
   }
   return console.log(result)
})
