const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender');

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 5 * 60,
    }

});

async function sendVerificationEmail(email, otp) {
    try {
        await mailSender(email, 'Verification Email from EduSpace', otp);
        console.log('Email sent successfully to - ', email);
    } catch (error) {
        console.log('Error while sending mail (mailSender) - ', email);
    }
}
OTPSchema.pre('save', async function (next) {
    if (this.isNew) {
        await sendVerificationEmail(this.email, this.otp);
    }
    next();
});


module.exports = mongoose.model('OTP', OTPSchema);