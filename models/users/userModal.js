const mongoose = require('mongoose');


// Define the user schema
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,

    },
    email: {
        type: String,
        required: true,

    },
    password: {
        type: String,
        required: true
    },
    profileImage: {
        type: String,
        // required: true
    },

    coverImage: {
        type: String,
    },
    posts:[{type:mongoose.Schema.Types.ObjectId,ref:"Post"}],
    comments:[{type:mongoose.Schema.Types.ObjectId,ref:"Comment"}]

},
    {
        timestamps: true
    }
);

// Create the user model
const User = mongoose.model('User', userSchema);

module.exports = User;
