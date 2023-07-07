const express = require("express");
const multer = require("multer");
const protectedRoute = require("../../middlewares/ProtectedRoute");
const appError = require("../../util/appError")
const Post = require("../../models/posts/postModal")
const {
  storage,
  handleFileUploadErrorForPost,
} = require("../../config/cloudinary");
const {
  createPost,
  getAllPost,
  getPostById,
  deletePost,
  updatePost,
} = require("../../controllers/posts/postsController");
const postRouter = express.Router();
const upload = multer({ storage });

postRouter.post(
  "/create",
  protectedRoute,
  upload.single("image"),
  handleFileUploadErrorForPost,
  createPost
);

postRouter.get("/getAll", getAllPost);

postRouter.get("/getById/:id", getPostById);

postRouter.delete("/delete/:id", protectedRoute, deletePost);

postRouter.put("/update/:id", protectedRoute, upload.single("image"), updatePost);

postRouter.get("/get-form-update/:id", async (req, res, next) => {
  const id = req.params.id;
  try {
    const response = await Post.findById(id)
    if (response) {
      return res.render("posts/updatePost.ejs", {
        formData: response,
        error:null
      });
    } else return next(appError("No post available", 404));
  } catch (error) {
    return next(appError(error.message, 500));
  }
});

postRouter.get("/addNewPost", (req, res, next) => {
  const data = {
    error: null,
    type: null,
  };
  res.render("posts/addPost.ejs", {
    data,
  });
});

postRouter.get("/postDetails", (req, res, next) => {
  const data = {
    error: null,
    type: null,
  };
  res.render("posts/postDetails.ejs", {
    data,
  });
});



module.exports = postRouter;
