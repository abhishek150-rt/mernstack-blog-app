const User = require("../../models/users/userModal");
const formatDate = require("../../util/timeFormatter")
const bcrypt = require("bcryptjs");
const cloudinary = require("cloudinary");
const appError = require("../../util/appError");
const customError = require("../../util/customError");
// Server-side code


const registerUser = async (req, res, next) => {

  const { fullName, email, password, profileImage, coverImage } = req.body;
  const formData = { fullName, email, password }

  if (!fullName || !email || !password) {
    // return res.render("users/register.ejs", {
    //   error: "All fields are required.",
    //   formData
    // });
    return res.json({
      status: 400,
      message: "All fields are required.",
      data: null
    })
  }

  const userFound = await User.findOne({ email });

  if (userFound)
    // for frontend
    // return res.render("users/register.ejs", {
    //   error: "User already registered with email.",
    //   formData
    // });
    // for backend
    // return next(appError("User already registered with email", 409));

    return res.json({
      message:"User already registered with email",
      status:409,
      data:null
    })

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user using the User model
    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      profileImage,
      coverImage,
    });

    const response = await user.save();
    if (response) {

      // Send success message to user (for backend)
      res.status(200).json({
        message: "User Registered Successfully",
        status: 200,
      });

      // Redirect user to login page (for frontend)
      // return res.redirect("/api/v1/users/login");
    }
  } catch (error) {
    // for frontend
    // return res.render("users/register.ejs", {
    //   error: error.message,
    //   formData
    // });

    // for backend
    return next(appError(error.message, 500));
  }
};

const loginUser = async (req, res, next) => {
  // Extract data from the request body
  const { email, password } = req.body;
  const formData = {
    email, password
  }

  try {
    // Find the user with the provided email in the database
    const loggedInUser = await User.findOne({ email });


    if (!loggedInUser) {
      //===========For Frontend=============//
      return res.render("users/login", {
        error: "User not found",
        formData
      });

      //===========For Backend=============//
      // const err = appError("User not found", 404);
      // return next(err);
    }

    // Compare the provided password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, loggedInUser.password);

    if (passwordMatch) {
      // Set user as authenticated in session
      req.session.authenticated = true;
      req.session.user = loggedInUser._id;

      // Passwords match, user is authenticated
      // return res.render("/users/profile.ejs");
      setTimeout(() => {
        return res.redirect("/api/v1/users/profile");
      }, 1000);

      // res.json({ message: "Login successful", status: 200 });
    } else {
      //===========For Frontend=============//
      return res.render("users/login", {
        error: "Invalid credentials",
        formData
      });

      // const err = appError("Invalid credentials", 402);
      // return next(err);
    }
  } catch (error) {
    //===========For Frontend=============//
    return res.render("users/login", {
      error: error.message,
      formData
    });

    //===========For Backend=============//
    // return next(appError(error.message, 500));
  }
};

const getPublicProfile = async (req, res, next) => {
  try {
    const id = req.session.user;

    if (!id) return next(appError("Must provide user id to proceed", 404));

    const user = await User.findById(id).populate("posts").populate("comments");

    if (!user) return next(appError("User not found", 404));


    const { email, fullName, password } = user;

    //For Frontend
    return res.render("users/updateUser", {
      error: null,
      formData: { email, fullName, password }
    });

    // For Backend
    // return res.status(200).json({
    //   message: "success",
    //   status: 200,
    //   data: user,
    // });
  } catch (error) {
    return next(appError(error.message, 500));
  }
};


const getPrivateProfile = async (req, res, next) => {

  try {
    const userId = req.session.user;
    const user = await User.findById(userId)
      .populate("posts")
      .populate("comments");

    if (!user) res.status(404).json({ message: "User not found" });
    else {
      //  res.status(200).json(user);
      res.render("users/profile", {
        user,
        formatDate,
      });
    }
  } catch (error) {
    return next(appError(error.message, 500));
  }
};

const updateUserProfile = async (req, res, next) => {
  const id = req.session.user;

  const { email, fullName, password } = req.body;
  const formData = { email, fullName, password }

  try {
    if (!id) {
      // next(appError("Must provide user ID to proceed", 404));
      return res.render("users/updateUser", {
        error: "Must provide user ID to proceed",
        formData
      });
    }
    if (!email || !fullName || !password) {
      // next(appError("Must provide email and fullname to proceed", 404));
      return res.render("users/updateUser", {
        error: "All fields are mandatory.",
        formData
      });
    }

    // Check if another user already has the provided email
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== id) {
      // next(appError("Email already exists", 409));
      return res.render("users/updateUser", {
        error: "Another user already has the provided email.",
        formData
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await User.findByIdAndUpdate(id, { email, fullName, password: hashedPassword }, { new: true });

    if (!updatedUser) {
      // return next(appError("User not found", 404));
      return res.render("users/updateUser", {
        error: "User not found",
        formData
      });

    } else {
      // return res.status(200).json({
      //   message: "User updated successfully",
      //   status: 200,
      //   data: updatedUser,
      // });
      return res.redirect("/api/v1/users/profile");

    }
  } catch (error) {
    // return next(appError(error.message, 500));
    return res.render("users/updateUser", {
      error: error.message || "Unable to process your request.",
      formData
    });
  }
};

const uploadProfilePicture = async (req, res, next) => {

  if (!req.file) {
    const data = {
      error: "No file uploaded.",
      type: "error",
    };
    return res.render("users/uploadProfilePhoto.ejs", { data });
  }

  try {
    if (!req.file.mimetype.startsWith("image")) {
      const data = {
        error: "Unsupported media type. Please upload an image file.",
        type: "error",
      };
      return res.render("users/uploadProfilePhoto.ejs", { data });
    }

    if (req.file.path) {
      const userId = req.session.user;
      const updatedUser = await User.findByIdAndUpdate(userId, { profileImage: req.file.path }, { new: true });

      if (updatedUser) res.redirect("/api/v1/users/profile");
      else return next(appError("Image upload failed", 500));

    }
  } catch (err) {
    const data = {
      error: JSON.stringify(err) || "Unsupported media file.",
      type: "error",
    };
    return res.render("users/uploadProfilePhoto.ejs", { data });
  }
};


const uploadCoverPhoto = async (req, res, next) => {

  if (!req.file) {
    const data = {
      error: "No file uploaded.",
      type: "error",
    };
    return res.render("users/uploadCoverPhoto.ejs", { data });
  }
  try {
    // const result = await cloudinary.uploader.upload(req.file.path); // Upload the file to Cloudinary

    if (req.file.path) {
      const userId = req.session.user;
      const updatedUser = await User.findByIdAndUpdate(userId, { coverImage: req.file.path }, { new: true });

      if (updatedUser) {
        res.redirect("/api/v1/users/profile");
        // return res
        //   .status(200)
        //   .json({ message: "Cover photo uploaded successfully.", status: 200 });
      } else next(appError("Cover photo upload failed", 500));
    }
  } catch (err) {
    return next(appError(err.message, 500));
  }
};

const updatePassword = async (req, res, next) => {
  const id = req.params.id;
  const { currentPassword, newPassword } = req.body;

  try {
    if (!id) throw appError("Must provide user ID to proceed", 404);


    // Check if the user exists
    const user = await User.findById(id);
    if (!user) throw appError("User not found", 404);


    // Check if the current password matches the stored password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) throw appError("Incorrect current password", 400);


    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: "Password updated successfully",
      status: 200,
    });
  } catch (error) {
    return next(appError(error.message, 500));
  }
};

const logout = async (req, res, next) => {
  try {
    req.session.destroy((err) => {
      if (err) return next(appError("Error destroying session", 500));
      else return res.redirect("/api/v1/users/login");

    });
  } catch (error) {
    return next(appError(error.message, 500));
  }
};

module.exports = {
  registerUser,
  loginUser,
  getPublicProfile,
  getPrivateProfile,
  uploadProfilePicture,
  uploadCoverPhoto,
  updatePassword,
  logout,
  updateUserProfile,
};
