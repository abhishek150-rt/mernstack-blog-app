const mongoose = require('mongoose');

// Define the comment schema
const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },

}, { timestamps: true }
);

// Create the comment model
const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
