const mongoose = require('mongoose');

// Define the post schema
const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true,
            enum: ["reactjs", "expressjs", "html", "java", "others" ,"webdev" ,"sports"]
        },
        image: {
            type: String,
            // required: true,
        },
        author:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        comments:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Comment"
        }]
    }, { timestamps: true }
);

// Create the post model
const Post = mongoose.model('Post', postSchema);

module.exports = Post;
