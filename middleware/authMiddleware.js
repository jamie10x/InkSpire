const jwt = require('jsonwebtoken');
const User =require('../models/User');

// This middleware checks for a user but does NOT protect the route.
// It makes the user object available in templates for all routes.
exports.checkUser = async (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            res.locals.user = await User.findById(decoded.user.id).select('-password');
        } catch (err) {
            res.locals.user = null;
        }
    } else {
        res.locals.user = null;
    }
    next();
};

exports.protect = (req, res, next) => {
    if (res.locals.user) {
        return next();
    }
    req.flash('error', 'Please log in to view that resource.');
    res.status(401).redirect('/auth/login');
};