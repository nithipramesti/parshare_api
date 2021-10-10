const { db } = require("../database");
const { createToken } = require("../helper/createToken");
const Crypto = require("crypto");
const transporter = require("../helper/nodemailer");

module.exports = {
  registerUser: (req, res) => {
    let { email, username, password } = req.body;
    password = Crypto.createHmac("sha1", process.env.SHARED_KEY)
      .update(password)
      .digest("hex"); //hash password before save to db
    checkUserQuery = `select * from users where email = "${email}"`;
    db.query(checkUserQuery, (checkErr, checkResult) => {
      if (checkErr) {
        return res.status(500).send({
          message: "Internal Server Error",
          error: checkErr,
        });
      }

      if (checkResult[0]) {
        res.status(200).send({
          message: "User Already Registered",
          success: false,
        });
      } else {
        let insertQueryUser = `insert into users values (null,${db.escape(
          username
        )},${db.escape(email)},${db.escape(
          password
        )},'user','false',null,null,null,null,null)`;
        db.query(insertQueryUser, (err, result) => {
          if (err) {
            return res.status(500).send({
              message: "Internal Server Error",
              error: err,
            });
          }
          if (result.insertId) {
            let selectQuery = `select * from users where id_user = ${result.insertId}`;
            db.query(selectQuery, (errRes, resultRes) => {
              if (errRes) {
                res.status(500).send("internal server error");
              }

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
              } = resultRes[0];

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

              console.log(`token : ${token}`);

              let mail = {
                from: "admin <parshare.company@gmail.com>",
                to: `${email}`,
                subject: "Account Verification",
                html: `Hi ${username},
                            <br>
                            Please click the link below to complete your verification process
                            <br>
                            <a href = "http://localhost:3000/authentication/${token}">Click here</a>
                            <br>
                            Thank you
                            `,
              };

              transporter.sendMail(mail, (errMail, resMail) => {
                if (errMail) {
                  console.log(errMail);
                  res.status(200).send({
                    message: "Registration Failed",
                    success: false,
                  });
                }
                res.status(200).send({
                  message: `Hi ${username}, please check your email to complete your registration process`,
                  success: true,
                  data: {
                    id_user: resultRes[0].id_user,
                    email: resultRes[0].email,
                    username: resultRes[0].username,
                    role: resultRes[0].role,
                    isVerified: resultRes[0].verified,
                  },
                });
              });
            });
          }
        });
      }
    });
  },
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
  verification: (req, res) => {
    let updateQueryVerified = `update users set verified = 'true' where id_user = ${req.user.id_user}`;
    db.query(updateQueryVerified, (errUpdate, resultUpdate) => {
      if (errUpdate) {
        console.log(`error : ${errUpdate}`);
        return res.status(500).send({
          message: "Internal Server Error",
          error: errUpdate,
        });
      }
      let selectQueryVerified = `select * from users where id_user = ${req.user.id_user}`;
      db.query(selectQueryVerified, (errSelect, resultSelect) => {
        if (errSelect) {
          console.log(`error : ${errSelect}`);
          return res.status(500).send({
            message: "Internal Server Error",
            error: errSelect,
          });
        }

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
        } = resultSelect[0];

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

        console.log(`token after update status to verified : ${token}`);

        res.status(200).send({
          message: "verified account",
          success: true,
          token,
        });
      });
    });
  },
};
