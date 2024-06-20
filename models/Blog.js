// Import the mongoose library for MongoDB object modeling
const mongoose = require('mongoose');
// Define a schema for the Blog collection

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Blog', BlogSchema);