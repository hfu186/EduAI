const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: {
        success: false,
        message: "Too many requests from this IP, please try again after 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const aiServiceLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20, 
    message: {
        success: false,
        message: "AI quota exceeded for this hour. Please focus on your current lessons and try again later.",
    },
    handler: (req, res, next, options) => {
        console.warn(`AI Rate Limit exceeded by IP: ${req.ip}`);
        res.status(options.statusCode).send(options.message);
    },
    standardHeaders: true,
    legacyHeaders: false,
});


const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, 
    max: 5, 
    message: {
        success: false,
        message: "Too many login attempts. Please try again after 10 minutes.",
    },
});

module.exports = { globalLimiter, aiServiceLimiter, authLimiter };