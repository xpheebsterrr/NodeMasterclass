//validate password: (?=.*[A-Za-z]) at least one char, (?=.*\d) at least one digit, (?=.*[@$!%*#?&]) at least one special char, [A-Za-z\d@$!%*#?&]{8,10} total length btw 8 to 10 char
const validatePassword = password => {
   const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,10}$/
   return passwordRegex.test(password)
}

const bcrypt = require("bcrypt")

const hashPassword = async password => {
   if (!validatePassword(password)) {
      throw new Error("Password does not meet the required criteria.")
   }
   const saltRounds = 10
   return await bcrypt.hash(password, saltRounds)
}

module.exports = {
   validatePassword,
   hashPassword
}
