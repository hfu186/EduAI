const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    gender: {
        type: String
    },
    dateOfBirth: {
        type: String
    },
    about: {
        type: String,
        trim: true
    },
    contactNumber: {
        type: Number,
        trim: true
    },
    qualifications: {
        type: String,
        trim: true,
        default: ''
    },
    experience: {
        type: String,
        trim: true,
        default: ''
    }

});


module.exports = mongoose.model('Profile', profileSchema);