const express = require('express'), router = express.Router();
const Blog = require('../models/Blog');
const User = require('../models/User');
const jwt = require('jsonwebtoken'), secret_sauce = process.env.SECRET_KEY;

// Render the login page
router.get('/login', (req, res) => {
    res.render('login', );
});

// Render the registration page
router.get('/register', (req, res) => {
    res.render('register', { title: 'Register', });
});

// Handle registration logic
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = await User.findOne({email:email})
        console.log(username, email, password, user)
        if (user) res.redirect('/auth/register');
        const newuser = new User({
            username: username,
            email: email,
            password: password
        });
        await newuser.save();
        res.redirect('/auth/login')
        } catch (err) {
        console.error(err.message);
    }
});

// Handle login logic
router.post('/login', async (req, res) => {
try{
    const {email, password} = req.body;
    const user = await User.findOne({email:email})
    if (!user || password !== user.password) {
        return res.render('login');
    }
      const token = jwt.sign({ name: user.username, iat: Math.floor(Date.now() / 1000) - 30 }, secret_sauce,);
       res.cookie('jwt', token, { httpOnly: true }).redirect(`/dashboard`);
    } catch (error) {
      console.error(error);
      res.render('login');
    }
});

router.get('/logout', (req, res) => {
    res.clearCookie('jwt');
    res.redirect('/auth/login'); // Redirect to login page
});

router.get('/my-articles', async (req, res) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            console.log('Missing JWT');
            return res.status(401).send('Unauthorized: No token provided');
        }

        // Verify and decode the token
        jwt.verify(token, secret_sauce, async (err, decoded) => {
            if (err) {
                console.log('Invalid token');
                return res.status(401).send('Unauthorized: Invalid token');
            }

            const username = decoded.name;
            console.log('Decoded username:', username);

            // Find the user by username
            const user = await User.findOne({ username });
            if (!user) {
                console.log('User not found');
                return res.status(404).send('User not found');
            }

            console.log('User found:', user);

            // Query to find all blogs by the user sorted by createdAt in descending order
            const blogs = await Blog.find({ author: user._id }).sort({ createdAt: -1 }).populate('author', 'username');

            console.log('Blogs found:', blogs);

            // Render the "My Articles" page with blogs and username
            res.render('myarticles', {
                blogs,
                username: user.username
            });
        });
    } catch (error) {
        console.error('Error fetching user articles:', error);
        res.status(500).send('Server error');
    }
});

module.exports = router;




