const jwt = require('jsonwebtoken')


module.exports = {
    auth:(req,res,next) => {
        token = req.headers.authorization.split(' ')[1]
        jwt.verify(token, process.env.SECRET_KEY, (err, decode) => {
            if(err) {
                return res.status(401).send({
                    message : "authorization failed",
                    error : err
                })
            }
            req.user = decode

            next()
        })
    }
}