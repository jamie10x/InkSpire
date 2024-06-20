require('dotenv').config();
const express = require('express'), app = express();
const bodyParser = require('body-parser'), path = require('path');
const authRoutes = require('./routes/authRoutes'), blogRoutes = require('./routes/blogRoutes');
const  dashboard = require('./routes/dashboard');
const  morgan = require('morgan');
const cookie = require('cookie-parser');
const mongoose = require('mongoose'), db_key = process.env.MONGODB_URI;
// Middleware to parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: true })).use(bodyParser.json());
// Middleware for logging HTTP requests
app.use(morgan('dev'));
// Setting EJS as the view engine
app.set('view engine', 'ejs');
// Serve static files like CSS and images
app.use(express.static(path.join(__dirname, 'public'))).use(cookie());
// DB connection
mongoose.connect(db_key)
 .then(()=> console.log('DB connected'))
 .catch(err => console.log('error happened', err));
// Routes
app.use('/auth', authRoutes);
app.use('/blogs', blogRoutes);
app.use('/dashboard', dashboard);

// Home route
app.get('/', async (req, res) => {  res.render('register') });
// Render the registration page
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});