const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: true,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

const mailSender = async (email, title, body) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: email,
            subject: title,
            html: body,
        });

        return info;
    } catch (error) {
        console.error("Error while sending mail:", error);
        throw error;
    }
};

module.exports = mailSender;