const jwt = require("jsonwebtoken");

module.exports = {
  authToken: (req, res, next) => {
    jwt.verify(req.token, `${process.env.SHARED_KEY}`, (err, decode) => {
      if (err) {
        return res.status(401).send({ errMessage: "Can't decode token" });
      }
      req.dataDecode = decode; //decrypt token back into user data

      next();
    });
  },
};
