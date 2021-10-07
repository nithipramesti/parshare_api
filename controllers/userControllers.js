const { db } = require("../database");
const Crypto = require('crypto');
const {createToken} = require('../helper/createToken')
const transporter = require('../helper/nodemailer')

module.exports = {
    registerUser : (req,res) => {
        let {email, username, password} = req.body
        password = Crypto.createHmac("sha1", process.env.SHARED_KEY).update(password).digest('hex') //hash password before save to db
        checkUserQuery = `select * from users where email = "${email}"`
        db.query(checkUserQuery,(checkErr,checkResult) => {
            if(checkErr){
                return res.status(500).send({
                    message : "Internal Server Error",
                    error : checkErr,
                })
            }

            if(checkResult[0]){
                res.status(200).send({
                    message : "User Already Registered",
                    success : false
                })
            }else{
                let insertQueryUser = `insert into users values (null,${db.escape(username)},${db.escape(email)},${db.escape(password)},'user','false',null,null,null,null,null)`
                db.query(insertQueryUser,(err,result)=>{
                    if(err){
                        return res.status(500).send({
                            message : "Internal Server Error",
                            error : err,
                        })
                    }
                    if(result.insertId){
                        let selectQuery = `select * from users where id_user = ${result.insertId}`
                        db.query(selectQuery, (errRes,resultRes) => {
                            if(errRes){
                                res.status(500).send("internal server error")
                            } 
                            
                            let {id_user, username, email, password, role, verified, gender, fullname, address, birthdate, picture_link} = resultRes[0]

                            let token = createToken({id_user, username, email, password, role, verified, gender, fullname, address, birthdate, picture_link})

                            console.log(`token : ${token}`)

                            let mail = {
                                from : "admin <mohammad.mauliadi@gmail.com>",
                                to : `${email}`,
                                subject : "Account Verification",
                                html : `<a href = "http://localhost:3000/authentication/${token}">Click here</a>`
                            }
        
                            transporter.sendMail(mail, (errMail, resMail) => {
                                if(errMail){
                                    console.log(errMail)
                                    res.status(200).send({
                                        message : "Registration Failed",
                                        success : false
                                    })
                                }
                                res.status(200).send({
                                    message : `Hi ${username}, please check your email to complete your registration process`,
                                    success : true,
                                    data : {
                                        id_user : resultRes[0].id_user,
                                        email : resultRes[0].email,
                                        username : resultRes[0].username,
                                        role : resultRes[0].role,
                                        isVerified : resultRes[0].verified
                                    }
                                })
                            })
                        })
                    }
                })
            }
        })
    },
    verification : (req,res) => {
        let updateQueryVerified = `update users set verified = 'true' where id_user = ${req.user.id_user}`
        db.query(updateQueryVerified,(errUpdate,resultUpdate) => {
            if(errUpdate){
                console.log(`error : ${errUpdate}`)
                return res.status(500).send({
                    message : "Internal Server Error",
                    error : errUpdate
                })
            }
            let selectQueryVerified = `select * from users where id_user = ${req.user.id_user}`
            db.query(selectQueryVerified,(errSelect, resultSelect) => {
                if(errSelect){
                    console.log(`error : ${errSelect}`)
                    return res.status(500).send({
                        message : "Internal Server Error",
                        error : errSelect,
                    })
                }

                let {id_user, username, email, password, role, verified, gender, fullname, address, birthdate, picture_link} = resultSelect[0]

                let token = createToken({id_user, username, email, password, role, verified, gender, fullname, address, birthdate, picture_link})

                console.log(`token after update status to verified : ${token}`)

                res.status(200).send({
                    message: "verified account",
                    success: true,
                    token
                })
            })
        })
    },
}