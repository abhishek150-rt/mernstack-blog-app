const express = require("express");
const multer = require("multer");
const Post = require("../../models/posts/postModal");
const {storage,handleFileUploadErrorForProfile,handleFileUploadErrorForCover} = require("../../config/cloudinary");

const userRouter = express.Router();
const {
  registerUser,
  loginUser,
  getPublicProfile,
  getPrivateProfile,
  updateUserProfile,
  uploadProfilePicture,
  uploadCoverPhoto,
  updatePassword,
  logout,
} = require("../../controllers/users/userController");
const protectedRoute = require("../../middlewares/ProtectedRoute");

// Create a store instance
const upload = multer({ storage: storage });



userRouter.post("/register", registerUser);

userRouter.post("/login", loginUser);

userRouter.get("/profile/public", getPublicProfile);

userRouter.get("/profile/private", protectedRoute, getPrivateProfile);

userRouter.put("/profile/update", updateUserProfile);

userRouter.put("/cover-photo-upload/", protectedRoute, upload.single("cover-photo"),handleFileUploadErrorForCover,  uploadCoverPhoto);

userRouter.put("/profile-photo-upload/", protectedRoute, upload.single("image"), handleFileUploadErrorForProfile,uploadProfilePicture);

userRouter.put("/update-password/:id", updatePassword);

userRouter.post("/logout", logout);

//====================FRONTEND ROUTES API==============//// Catch-all route handler for undefined routes

userRouter.get("/update-user", (req, res, next) => {
  res.render("users/updateUser.ejs", {
    error: "",
    formData: {}
  });
});

userRouter.get("/upload-profile-photo", (req, res, next) => {
  const data = {
    error: null,
    tpye: null
  }
  res.render("users/uploadProfilePhoto.ejs", {
    data
  });
});

userRouter.get("/upload-cover-photo", (req, res, next) => {
  const data = {
    error: null,
    tpye: null
  }
  res.render("users/uploadCoverPhoto.ejs", { data });
});

userRouter.get("/profile", protectedRoute, getPrivateProfile);

userRouter.get("/register", (req, res, next) => {
  res.render("users/register.ejs", {
    error: "",
    formData: {}
  });
});

userRouter.get("/login", (req, res, next) => {
  res.render("users/login.ejs", {
    error: "",
    formData: {}
  });
});

userRouter.get("/", async (req, res) => {
  try {
    const response = await Post.find().populate("author");
    res.render("index.ejs", {
      data: response,
      error: null
    });


  } catch (error) {
    // return next(appError(error.message, 500));
    res.render("index.ejs", {
      data: [],
      error: error.message
    });

  }


});

module.exports = userRouter;
