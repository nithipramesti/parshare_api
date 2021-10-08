const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: 'parshare.company@gmail.com',
        pass: process.env.EMAIL_CRED
    },
    tls : {
        rejectUnauthorized: false
    }
})

module.exports = transporter