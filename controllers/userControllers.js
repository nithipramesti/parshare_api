const { db } = require("../database");
const Crypto = require('crypto');

module.exports = {
    registerUser : (req,res) => {
        let {email, username, password} = req.body
        console.log(username)
        password = Crypto.createHmac("sha1", process.env.SHARED_KEY).update(password).digest('hex') //hash password before save to db
        checkUserQuery = `select * from users where username = "${username}"`
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
                    res.status(200).send({
                        message : "Register Success",
                        success : true
                    })
                })
            }
            
        })
        
    }
}