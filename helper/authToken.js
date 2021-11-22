const jwt = require("jsonwebtoken");

module.exports = {
  auth: (req, res, next) => {
    jwt.verify(req.token, process.env.TOKEN_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).send({
          success: false,
          data: "User not auth!",
        });
      }
      req.user = decoded;
      next();
    });
  },
  authToken: (req, res, next) => {
    jwt.verify(req.token, `${process.env.SHARED_KEY}`, (err, decode) => {
      if (err) {
        return res.status(200).send({ errMessage: "Can't decode token" });
      }
      req.dataDecode = decode; //decrypt token back into user data

      next();
    });
  },
};
