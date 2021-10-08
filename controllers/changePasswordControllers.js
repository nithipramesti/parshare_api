const { db } = require("../database");
const { createToken } = require("../helper/createToken");
const Crypto = require("crypto");

module.exports = {
  sendEmail: (req, res) => {
    //MySQL query to get data from user email
    let scriptQuery = `Select * from users where email=${db.escape(
      req.body.email
    )};`;

    //check & get user data from MySQL
    db.query(scriptQuery, (err, results) => {
      if (err) {
        res.status(500).send({ errMessage: "Internal server error" });
      }

      if (results[0]) {
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

        //create token
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
          console.log(
            `Email '${email}' is registered, will send reset password link`
          );

          //SEND EMAIL HERE////////

          res.status(200).send({
            dataLogin: results[0],
            token,
            message:
              "Link sent successfully. Please check your email and follow the instructions to reset your password.",
          });
        }
      } else {
        res.status(200).send({
          errMessage: "Email is incorrect or not registered yet",
        });
      }
    });

    //send email
  },
};
