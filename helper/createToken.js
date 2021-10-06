const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
dotenv.config()

module.exports = {
  createToken: (payload) => {
    return jwt.sign(payload, process.env.TOKEN_KEY,{
      expiresIn: "12h"
    })
  }
}