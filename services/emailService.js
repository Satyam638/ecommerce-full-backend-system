const nodemailer = require('nodemailer');
require('dotenv').config();

// send mail 
const sendMail = async (toEmail, subject, text) => {

    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.USER_EMAIL,   // ✅ FIXED
            pass: process.env.USER_PASS
        }
    });

    const mailOptions = {
        from: process.env.USER_EMAIL,
        to: toEmail,
        subject: subject,
        text
    };

    // send mail
    const info = await transport.sendMail(mailOptions); // ✅ FIXED
    console.log('Email Sent Successfully', info.messageId);
};

module.exports = sendMail;