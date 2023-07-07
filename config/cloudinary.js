
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer")
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "blog-app", // Destination folder for uploaded files in Cloudinary
   
  },
  allowed_formats: ["jpg", "jpeg", "png"], // Allowed file formats
});

function handleFileUploadError(err, req, res, next, renderPage ) {
  if (err instanceof multer.MulterError || err) {
    const data = {
      error: err.message + ". Only jpg, jpeg, png images allowed" ,
      type: "error",
    };
    return res.render(renderPage, { data });
  } else {
    next();
  }
}

function handleFileUploadErrorForPost(err, req, res, next) {
  handleFileUploadError( err, req, res, next, "posts/addPost");
}

function handleFileUploadErrorForProfile(err, req, res, next) {
  handleFileUploadError( err, req, res, next, "users/uploadProfilePhoto.ejs");
}

function handleFileUploadErrorForCover(err, req, res, next) {
  handleFileUploadError( err, req, res, next, "users/uploadCoverPhoto.ejs");
}



module.exports = {storage,handleFileUploadErrorForPost,handleFileUploadErrorForProfile,handleFileUploadErrorForCover};
