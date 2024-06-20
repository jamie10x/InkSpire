const express  = require('express'), router = express.Router();
const Blog = require('../models/Blog.js');
const User = require('../models/User.js');
const jwt = require('jsonwebtoken'), secret = process.env.SECRET_KEY;

// Render the dashboard page
router.get('/', async (req,res)=>{
    try {
        // Retrieve JWT token from cookies
        const token = req.cookies.jwt;
        if(!token) console.log('missing jwt');
    // Decode the JWT token to get the username
      const username = jwt.decode(token)
      console.log(username);
    // Query to find the latest 20 blogs sorted by created_at in descending order
    const blogs = await Blog.find()
    .sort({ created_at: -1 }) // Sort by created_at in descending order
    .limit(20); // Limit the results to 20
        
    // Find the user by username
const user = await User.find({username:username.name});
console.log(typeof(user));
    // Render the dashboard page with the latest blogs and username
    res.render('dashboard', {blogs, username:user.username})
    } catch (error) {
        
    }
})

module.exports = router;