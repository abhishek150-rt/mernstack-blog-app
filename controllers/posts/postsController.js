const Post = require("../../models/posts/postModal");
const User = require("../../models/users/userModal");
const appError = require("../../util/appError");
const formatDate = require("../../util/timeFormatter");

const createPost = async (req, res, next) => {
  const { title, description, category } = req.body;

  try {
    if (!title || !description || !category || !req.file) {
      // return next(appError("All fields are required", 404));
      const data = {
        error: "All fields are required",
        type: "error",
      };
      return res.render("posts/addPost", {
        data,
      });
    }

    const userId = req.session.user;
    if (!userId) {
      // return next(appError("Unauthorized", 401));
      const data = {
        error: "Unauthorized",
        type: "error",
      };
      return res.render("posts/addPost", {
        data,
      });
    }

    const userFound = await User.findById(userId);
    if (!userFound) {
      // return next(appError("User not found", 404));
      const data = {
        error: "User not found",
        type: "error",
      };
      return res.render("posts/addPost", {
        data,
      });
    }

    const newPost = new Post({
      title,
      description,
      category,
      author: userId,
      image: req.file.path,
    });

    const response = await newPost.save();

    if (!response || Object.keys(response).length === 0) {
      // return next(appError("Something went wrong", 400));
      const data = {
        error: "Something went wrong",
        type: "error",
      };
      return res.render("posts/addPost", {
        data,
      });
    }

    userFound.posts.push(newPost);
    await userFound.save();

    //=========BACKEND RESPONSE=============//
    // return res.status(200).json({
    //   message: "Post Created Successfully",
    //   data: response,
    //   status: 200,
    // });

    //=========BACKEND RESPONSE=============//
    res.redirect("/api/v1/users/");
  } catch (error) {
    return next(appError(error.message, 500));
    // return res.render("posts/addPost",{
    //   error:error.message || "Something went wrong"
    // })
  }
};

const getAllPost = async (req, res, next) => {
  try {
    const response = await Post.find();

    // Send the deprecated response
    res
      .status(200)
      .header("Warning", '299 - "Deprecated API"')
      .header("Deprecation", "true")
      .json({
        message: "This API is deprecated.",
        status: 200,
        data: response,
      });
  } catch (error) {
    return next(appError(error.message, 500));
  }
};

const getPostById = async (req, res, next) => {
  const id = req.params.id;

  const loggedInUser = req.session.user;

  try {
    const response = await Post.findById(id).populate({ path: "comments", populate: { path: "user" } }).populate("author");
    if (response) {
      //=========BACKEND RESPONSE=============//
      // return res.status(200).json({
      //   message: "Success",
      //   status: 200,
      //   data: response,
      // });

      //=========FRONTEND RESPONSE=============//
      return res.render("posts/postDetails.ejs", {
        response,
        formatDate,
        loggedInUser,
        error: null,
      });
    } else return next(appError("No post available", 404));
  } catch (error) {
    return next(appError(error.message, 500));
  }
};

const deletePost = async (req, res, next) => {
  const postId = req.params.id;
  const userId = req.session.user;

  try {
    if (!userId) return next(appError("Unauthorized", 401));

    const userFound = await User.findById(userId);
    if (!userFound) return next(appError("User not found", 404));


    const postToDelete = await Post.findById(postId);
    if (!postToDelete) return next(appError("Post not found", 404));


    if (postToDelete.author.toString() !== userId) return next(appError("Unauthorized to delete this post", 403));


    await Post.deleteOne({ _id: postId });

    // Remove the post from the user's posts array
    const postIndex = userFound.posts.indexOf(postId);
    if (postIndex > -1) {
      userFound.posts.splice(postIndex, 1);
      await userFound.save();
    }

    //=========BACKEND RESPONSE=============//
    // return res.status(200).json({
    //   message: "Post deleted successfully",
    //   status: 200,
    // });

    //=========FRONTEND RESPONSE=============//
    res.redirect("/api/v1/users/profile");
  } catch (error) {
    return next(appError(error.message, 500));
  }
};

const updatePost = async (req, res, next) => {
  const { title, description, category } = req.body;
  var postToUpdate = {};

  // post id
  const id = req.params.id;

  //logged in user id
  const userId = req.session.user;

  try {
    if (!userId) {
      // return next(appError("Unauthorized", 401));
      return res.render("/posts/updatePost", {
        formData: { title, description, category, _id: id },
        error: "Unauthorized",
      });
    }

    const userFound = await User.findById(userId);
    if (!userFound) {
      // return next(appError("User not found", 404));
      return res.render("posts/updatePost", {
        formData: { title, description, category, _id: id },
        error: "User not found",
      });
    }

    postToUpdate = await Post.findById(id);
    if (!postToUpdate) {
      // return next(appError("Post not found", 404));
      return res.render("posts/updatePost", {
        formData: postToUpdate,
        error: "Post not found",
      });
    }

    if (postToUpdate.author.toString() !== userId) {
      // return next(appError("Unauthorized to update this post", 403));
      return res.render("posts/updatePost", {
        formData: postToUpdate,
        error: "Unauthorized to update this post",
      });
    }
    postToUpdate.title = title;
    postToUpdate.description = description;
    postToUpdate.category = category;
    if (req.file) postToUpdate.image = req.file.path;

    const updatedPost = await postToUpdate.save();
    if (updatedPost) return res.redirect("/");
    //=========BACKEND RESPONSE=============//
    // return res.status(200).json({
    //   message: "Success",
    //   status: 200
    // })

    //=========FRONTEND RESPONSE=============//
  } catch (err) {
    return res.render(`posts/updatePost`, {
      formData: postToUpdate,
      error: err.message,
    });
  }
};

module.exports = {
  createPost,
  getAllPost,
  getPostById,
  deletePost,
  updatePost,
};
