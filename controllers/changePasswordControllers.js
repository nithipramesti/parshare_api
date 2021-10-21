const { db } = require("../database");
const { createToken } = require("../helper/createToken");
const Crypto = require("crypto");
const transporter = require("../helper/nodemailer");
const jwt = require("jsonwebtoken");

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
          picture_link,
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
          picture_link,
        });

        if (verified != "true") {
          res.status(200).send({
            message:
              "Your account is not verified, please verify your account first",
          });
        } else {
          //SEND EMAIL
          let mail = {
            from: "Admin Parshare <parshare.company@gmail.com>",
            to: `${email}`,
            subject: "Account Verification",
            html: `Hi ${username},
                        <br>
                        <br>
                        Please click the link below to reset your password
                        <br>
                        <a href = "http://localhost:3000/reset-password/${token}">Reset Password</a>
                        <br>
                        `,
          };

          transporter.sendMail(mail, (errMail, resMail) => {
            if (errMail) {
              console.log(errMail);
              res.status(200).send({
                errMessage: "Sending reset password failed, please try again",
                success: false,
              });
            }

            res.status(200).send({
              message:
                "Link sent successfully. Please check your email and follow the instructions to reset your password.",
            });
          });

          console.log(
            `Email '${email}' is registered, will send reset password link`
          );
        }
      } else {
        res.status(200).send({
          errMessage: "Email is incorrect or not registered yet",
        });
      }
    });
  },

  decodeToken: (req, res) => {
    //Decode token
    jwt.verify(req.token, `${process.env.SHARED_KEY}`, (err, decode) => {
      if (err) {
        return res.status(401).send({ errMessage: "Can't decode token" });
      }
      req.dataDecode = decode; //decrypt token back into user data
    });

    //MySQL query to get data from user email
    let scriptQuery = `Select * from users where email=${db.escape(
      req.dataDecode.email
    )};`;

    //Check & get user data from MySQL
    db.query(scriptQuery, (err, results) => {
      if (err) {
        res.status(500).send({ errMessage: "Internal server error" });
      }

      if (results[0]) {
        console.log(
          `Token decoded and match user data with username ${results[0].username}`
        );

        res
          .status(200)
          .send({ userData: results[0], message: "Token is valid" });
      }
    });
  },

  resetPassword: (req, res) => {
    //Hashing password
    req.body.newPassword = Crypto.createHmac(
      "sha1",
      `${process.env.SHARED_KEY}`
    )
      .update(req.body.newPassword)
      .digest("hex");

    //CHANGE USER PASSWORD
    let updateQuery = `Update users set password = ${db.escape(
      req.body.newPassword
    )} where email=${db.escape(req.body.userData.email)};`;

    db.query(updateQuery, (err, results0) => {
      if (err) res.status(500).send({ errMessage: "Update user data failed" });

      //GET UPDATED USER DATA
      let selectQuery = `Select * from users where email=${db.escape(
        req.body.userData.email
      )};`;

      db.query(selectQuery, (err, results) => {
        if (err) res.status(500).send({ errMessage: "Get user data failed" });

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
            picture_link,
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
            picture_link,
          });

          console.log("Change password success, username: ", username);

          res.status(200).send({
            dataLogin: results[0],
            token,
            message: "Change password success",
          });
        } else {
          res.status(200).send({
            errMessage: "Can't match user data",
          });
        }
      });
    });
  },

  changePassword: (req, res) => {
    //Hashing old password
    const oldPassword = Crypto.createHmac("sha1", `${process.env.SHARED_KEY}`)
      .update(req.body.oldPassword)
      .digest("hex");

    //Get user data:

    let selectQuery = `Select * from users where email=${db.escape(
      req.body.userData.email
    )};`;

    db.query(selectQuery, (err, results1) => {
      console.log("result1");
      if (err)
        res
          .status(500)
          .send({ errMessage: "Server error, please try again later" });

      if (results1[0]) {
        if (results1[0].password === oldPassword) {
          //Hashing old password
          const newPassword = Crypto.createHmac(
            "sha1",
            `${process.env.SHARED_KEY}`
          )
            .update(req.body.newPassword)
            .digest("hex");

          //Edit user password:
          let updatePasswordQuery = `Update users set password = ${db.escape(
            newPassword
          )} where email=${db.escape(req.body.userData.email)};`;

          db.query(updatePasswordQuery, (err, results2) => {
            console.log("result2");
            if (err) {
              res
                .status(500)
                .send({ errMessage: "Server error, please try again later" });
            }

            console.log("Update password success, will get updated user data");

            let getNewDataQuery = `Select * from users where email=${db.escape(
              req.body.userData.email
            )};`;

            db.query(getNewDataQuery, (err, results3) => {
              console.log("result3");
              if (err) {
                res
                  .status(500)
                  .send({ errMessage: "Server error, please try again later" });
              }

              if (results3[0]) {
                console.log("result3 success");
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
                  picture_link,
                } = results3[0];

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
                  picture_link,
                });

                console.log("Get updated data success, username: ", username);

                res.status(200).send({
                  dataLogin: results3[0],
                  token,
                  message: "Change password success",
                });
              }
            });
          });
        } else {
          console.log("Old password do not match");

          res.status(200).send({
            errMessage: "The old password you have entered is incorrect",
          });
        }
      }
    });
  },
};
