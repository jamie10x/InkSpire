const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog.js');
const User = require('../models/User.js');
const jwt = require('jsonwebtoken'), secret = process.env.SECRET_KEY;

// Get all blogs
router.get('/', (req,res)=>{
    res.render('blogEditor');
});

// Handle registration logic
router.post('/', async (req, res) => {
    try {
        const { title, content, tags } = req.body;
        // Check if a blog with the same title already exists
        const thatpost = await Blog.findOne({ title: title });
        // Retrieve JWT token from cookies
        const token = req.cookies.jwt;
        if (!token) {
            console.log('missing jwt');
            return res.redirect('/auth/login'); // Redirect to login if no token
        }
        // If a blog with the same title exists, redirect to dashboard
        if (thatpost) {
            return res.redirect('/dashboard');
        }

        const decoded = jwt.verify(token, secret);
        const user = await User.findOne({ username: decoded.name });
        if (!user) {
            console.log('User not found');
            return res.status(404).send('User not found');
        }
        // Create a new blog post
        const newpost = new Blog({
            title: title,
            author: user._id,
            content: content,
            tags: tags
        });
        // Save the new blog post to the database
        await newpost.save();
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Render individual blog view
router.get('/:id', async (req, res) => {
    try {
        const blogid = req.params.id;
        // Find blog by ID and populate author field with username
        const blog = await Blog.findById(blogid).populate('author', 'username'); // Populate author for displaying username
        if (!blog) {
            return res.status(404).send('Blog not found');
        }
         // Render the blog view page with the blog data
        res.render('blogView', { blog });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


module.exports = router;