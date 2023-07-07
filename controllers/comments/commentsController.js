const Post = require("../../models/posts/postModal");
const User = require("../../models/users/userModal");
const Comment = require("../../models/comments/commentModal");
const appError = require("../../util/appError");
const formatDate = require("../../util/timeFormatter");

const createComment = async (req, res, next) => {
  const { message } = req.body;

  const userId = req.session.user;
  const postId = req.params.id;

  const post = await Post.findById(postId).populate({ path: "comments", populate: { path: "user" } }).populate("author");



  try {
    if (!userId) {
      return next(appError("Unauthorized", 401));
    }

    const userFound = await User.findById(userId);
    if (!userFound) {
      return next(appError("User not found", 404));
    }


    if (!post) {
      return next(appError("Post not found", 404));
    }

    const newComment = new Comment({
      message,
      user: userFound
    });

    const savedComment = await newComment.save();

    if (savedComment) {
      await Promise.all([
        Post.findByIdAndUpdate(
          postId,
          { $push: { comments: savedComment._id } },
          { validateBeforeSave: false }
        ),
        User.findByIdAndUpdate(
          userId,
          { $push: { comments: savedComment._id } },
          { validateBeforeSave: false }
        ),
      ]);

      //=========BACKEND RESPONSE=============//
      // return res.status(200).json({
      //   message: "Comment created successfully.",
      //   status: 200,
      // });
      //  getPostById()

      //=========FRONTEND RESPONSE=============//
      return res.redirect(`/api/v1/posts/getById/${postId}`)


    }
  } catch (err) {
    // return next(appError(error.message));
    return res.render("posts/postDetails", {
      response: post,
      formatDate,
      loggedInUser: userId,
      error: err.message || 'Empty string is not valid'
    });
  }
};

const getCommentById = async (req, res, next) => {
  const id = req.params.id
  const postId = req.params.postId;

  try {

    const comment = await Comment.findById(id);
    if (comment) {

      //=========BACKEND RESPONSE=============//
      // res.status(200).json({
      //   status: 200,
      //   data: comment
      // })

      //=========FRONEND RESPONSE=============//
      return res.render("comments/updateComment.ejs", {
        error: null,
        comment,
        postId
      })
    }
    else {
      return res.render("comments/updateComment.ejs", {
        error: "No data available",
        comment: {},
        postId
      })
    }

  } catch (error) {
    return res.render("comments/updateComment.ejs", {
      error: error.message || "Internal Server Error.",
      comment: {},
      postId
    })
  }
};

const deleteComment = async (req, res, next) => {
  const commentId = req.params.id;
  const postId = req.query.postId
  const userId = req.session.user;

  try {
    if (!userId) return next(appError("Unauthorized", 401));

    const comment = await Comment.findById(commentId);
    if (!comment) return next(appError("Comment not found", 404));

    if (comment.user.toString() !== userId) return next(appError("Unauthorized to delete this comment", 403));

    // Delete the comment document
    const response = await Comment.findByIdAndDelete(commentId);

    // return res.status(200).json({
    //   message: "Comment deleted successfully",
    //   status: 200,
    // });

    if (response) {

      //=========BACKEND RESPONSE=============//
      // return res.status(200).json({
      //   message: "Comment deleted successfully.",
      //   status: 200
      // })

      //=========FRONTEND RESPONSE=============//
      return res.redirect(`/api/v1/posts/getById/${postId}`)
    }
    else return next(appError("Something went wrong.", 500));

  } catch (error) {
    return next(appError(error.message, 500));
  }
};

const updateComment = async (req, res, next) => {
  const commentId = req.params.id;
  const userId = req.session.user;
  const postId = req.params.postId
  const { message } = req.body;

  try {
    if (!userId) {
      // return next(appError("", 401));
      return res.render("comments/updateComment.ejs", {
        error: "Unauthorized",
        comment: {
          message,
          _id: commentId
        },
        postId
      })
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      // return next(appError("Comment not found", 404));
      return res.render("comments/updateComment.ejs", {
        error: "Comment not found",
        comment: {
          message,
          _id: commentId
        },
        postId
      })
    }

    if (comment.user.toString() !== userId) {
      // return next(appError("Unauthorized to update this comment", 403));
      return res.render("comments/updateComment.ejs", {
        error: "Unauthorized to update this comment",
        comment: {
          message,
          _id: commentId
        },
        postId
      })
    }

    comment.message = message;
    const updatedComment = await comment.save();

    if (updatedComment) {

      //=========BACKEND RESPONSE=============//
      // return res.status(200).json({
      //   status: 200,
      //   message: "Comment has been updated successfully."
      // })

      //=========FRONTEND RESPONSE=============//
      return res.redirect(`/api/v1/posts/getById/${postId}`)
    }

  } catch (error) {
    // return next(appError(error.message, 500));
    return res.render("comments/updateComment.ejs", {
      error: error.message,
      comment: {
        message,
        _id: commentId
      },
      postId
    })
  }
};


module.exports = {
  createComment,
  getCommentById,
  deleteComment,
  updateComment,
};
