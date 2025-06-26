const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { protect } = require('../middleware/authMiddleware');

// --- Create ---
router.get('/', protect, blogController.showCreateForm);
router.post('/', protect, blogController.createBlog);

// --- Read ---
// NOTE: This route must be last, or it will treat 'edit' as an :id
router.get('/:id', protect, blogController.getBlogById);

// --- Update ---
router.get('/:id/edit', protect, blogController.showEditForm);
router.post('/:id/update', protect, blogController.updateBlog);

// --- Delete ---
router.post('/:id/delete', protect, blogController.deleteBlog);

module.exports = router;