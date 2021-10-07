const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: 'mohammad.mauliadi@gmail.com',
        pass: process.env.EMAIL_CRED
    },
    tls : {
        rejectUnauthorized: false
    }
})

module.exports = transporter