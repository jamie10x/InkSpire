const Blog = require('../models/Blog');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Display the form to create a new blog
exports.showCreateForm = (req, res) => {
    res.render('blogEditor', { user: req.user, title: 'Create Blog' });
};

// Handle the creation of a new blog post
exports.createBlog = async (req, res) => {
    try {
        const { title, content, tags } = req.body;

        if (!title || !content) {
            return res.status(400).send('Title and content are required.');
        }

        const cleanContent = DOMPurify.sanitize(content);

        const newBlog = new Blog({
            title,
            content: cleanContent,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            author: req.user.id
        });

        await newBlog.save();
        res.redirect(`/blogs/${newBlog._id}`);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Display a single blog post
exports.getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate('author', 'username');
        if (!blog) {
            return res.status(404).send('Blog not found');
        }
        res.render('blogView', { blog, user: req.user, title: blog.title });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Display all articles written by the logged-in user
exports.getMyArticles = async (req, res) => {
    try {
        const blogs = await Blog.find({ author: req.user.id }).sort({ createdAt: -1 });
        res.render('myarticles', { blogs, user: req.user, title: 'My Articles' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Display the user's dashboard with all recent posts
exports.getDashboard = async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 }).limit(20).populate('author', 'username');
        res.render('dashboard', { blogs, user: req.user, title: 'Dashboard' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Display the form to edit an existing blog
exports.showEditForm = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).send('Blog not found');
        }
        // Authorization check: Ensure the logged-in user is the author
        if (blog.author.toString() !== req.user.id) {
            return res.status(403).send('Not authorized to edit this post.');
        }
        res.render('blogEditView', { blog, user: req.user, title: 'Edit Post' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Handle the update of a blog post
exports.updateBlog = async (req, res) => {
    try {
        let blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).send('Blog not found');
        }
        // Authorization check
        if (blog.author.toString() !== req.user.id) {
            return res.status(403).send('Not authorized to update this post.');
        }

        const { title, content, tags } = req.body;
        const cleanContent = DOMPurify.sanitize(content);

        blog.title = title;
        blog.content = cleanContent;
        blog.tags = tags ? tags.split(',').map(tag => tag.trim()) : [];

        await blog.save();
        res.redirect(`/blogs/${blog._id}`);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Handle the deletion of a blog post
exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).send('Blog not found');
        }
        // Authorization check
        if (blog.author.toString() !== req.user.id) {
            return res.status(403).send('Not authorized to delete this post.');
        }

        await Blog.findByIdAndDelete(req.params.id);
        res.redirect('/auth/my-articles'); // Redirect to their list of articles
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

