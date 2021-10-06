const jwt = require("jsonwebtoken");

module.exports = {
  createToken: (payload) => {
    return jwt.sign(payload, `${process.env.SHARED_KEY}`, {
      expiresIn: "12h",
    });
  },
};
