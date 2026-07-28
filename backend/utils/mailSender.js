const nodemailer = require('nodemailer');

const mailSender = async (email, title,otp) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });
         body = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #4f46e5;">EduSpace - Email Verification</h2>

                <p>Hello,</p>

                <p>Thank you for registering with <strong>EduSpace</strong>.</p>

                <p>Please use the verification code below to verify your account:</p>

                <h1 style="
                    background: #4f46e5;
                    color: #ffffff;
                    display: inline-block;
                    padding: 12px 24px;
                    border-radius: 8px;
                    letter-spacing: 6px;
                    font-size: 32px;
                    margin: 10px 0;
                ">
                    ${otp}
                </h1>

                <p>This verification code is valid for <strong>5 minutes</strong>.</p>

                <p>
                    If you did not request to create an EduSpace account, you can safely ignore this email.
                    No further action is required.
                </p>

                <hr style="margin: 24px 0;" />

                <p>Best regards,</p>
                <p><strong>The EduSpace Team</strong></p>
            </div>
            `
        const info = await transporter.sendMail({
            from: 'EduSpace || by HfuIddTwn',
            to: email,
            subject: title,
            html: body
        });

        return info;
    }
    catch (error) {
        console.log('Error while sending mail (mailSender) - ', email);
    }
}

module.exports = mailSender;