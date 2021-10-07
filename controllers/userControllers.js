const { db } = require("../database");
const { createToken } = require("../helper/createToken");
const Crypto = require("crypto");

module.exports = {
  loginUser: (req, res) => {
    //Hashing password to match MySQL data:
    req.body.password = Crypto.createHmac("sha1", `${process.env.SHARED_KEY}`)
      .update(req.body.password)
      .digest("hex");

    //MySQL query to get data
    let scriptQuery = `Select * from users where email=${db.escape(
      req.body.email
    )} and password=${db.escape(req.body.password)};`;

    //Get data from MySQL
    db.query(scriptQuery, (err, results) => {
      if (err) res.status(500).send({ errMessage: "Internal Server Error" });

      if (results[0]) {
        //Destructuring results
        let {
          id_user,
          username,
          email,
          password,
          role,
          verified,
          gender,
          fullname,
          address,
          birthdate,
          pitcure_link,
        } = results[0];

        //create TOKEN -- will save on local storage via FE
        let token = createToken({
          id_user,
          username,
          email,
          password,
          role,
          verified,
          gender,
          fullname,
          address,
          birthdate,
          pitcure_link,
        });
        if (verified != "true") {
          res.status(200).send({ message: "Your account is not verified" });
        } else {
          console.log(`User '${results[0].username}' successfully logged in`);

          res
            .status(200)
            .send({ dataLogin: results[0], token, message: "Login success" });
        }
      } else {
        res.status(200).send({
          errMessage:
            "Email and password do not match, or you don't have an account yet",
        });
      }
    });
  },
  keepLogin: (req, res) => {
    //MySQL query to get data
    let scriptQuery = `Select * from users where email=${db.escape(
      req.dataDecode.email
    )} and password=${db.escape(req.dataDecode.password)};`;

    //Get data from MySQL
    db.query(scriptQuery, (err, results) => {
      if (err) res.status(500).send({ errMessage: "Internal server error" });

      if (results[0]) {
        console.log(
          `Data from token matches the database, keep user '${results[0].username}' logged in`
        );

        res.status(200).send({
          dataLogin: results[0],
          token: req.token,
          message: "Keep login success",
        });
      } else {
        console.log("Data doesn't match the database");
        res.status(200).send({
          errMessage: "Data doesn't match the database",
        });
      }
    });
  },
};
