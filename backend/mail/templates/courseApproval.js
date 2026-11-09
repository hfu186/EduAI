const nodemailer = require("nodemailer");

const courseApprovalEmail = async (email, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const info = await transporter.sendMail({
      from: `"EduSpace" <${process.env.MAIL_USER}>`,
      to: email,
      subject,
      html,
    });

    console.log("Course status email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending course status email:", error);
    throw error;
  }
};

module.exports = courseApprovalEmail;