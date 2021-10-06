const { db } = require("../database");
const Crypto = require('crypto');

module.exports = {
    registerUser : (req,res) => {
        let {email, username, password} = req.body
        console.log(username)
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
                    }
                })
            }
            
        })
        
    }
}