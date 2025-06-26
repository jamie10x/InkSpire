const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

exports.showLoginForm = (req, res) => { res.render('login', { title: 'Login' }); };
exports.showRegisterForm = (req, res) => { res.render('register', { title: 'Sign Up' }); };

exports.registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach(error => req.flash('error', error.msg));
        return res.redirect('/auth/register');
    }

    try {
        const { username, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) {
            req.flash('error', 'User with that email already exists.');
            return res.redirect('/auth/register');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user = new User({ username, email, password: hashedPassword });
        await user.save();

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        req.flash('success', 'Registration successful! Welcome to InkSpire.');
        res.redirect('/dashboard');

    } catch (err) {
        console.error(err);
        res.status(500).render('500', { title: 'Server Error' });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error', 'Invalid credentials.');
            return res.redirect('/auth/login');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            req.flash('error', 'Invalid credentials.');
            return res.redirect('/auth/login');
        }

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.redirect('/dashboard');

    } catch (err) {
        console.error(err);
        res.status(500).render('500', { title: 'Server Error' });
    }
};

exports.logoutUser = (req, res) => {
    res.clearCookie('token');
    req.flash('success', 'You have successfully logged out.');
    res.redirect('/auth/login');
};