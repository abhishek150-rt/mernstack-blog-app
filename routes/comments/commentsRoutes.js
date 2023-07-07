const express = require("express");
const commentsRoutes = express.Router();
const protectedRoute = require("../../middlewares/ProtectedRoute");
const {
  createComment,
  getCommentById,
  deleteComment,
  updateComment,
} = require("../../controllers/comments/commentsController");

commentsRoutes.post("/create/:id", protectedRoute, createComment);

commentsRoutes.get("/getById/:id/:postId", getCommentById);

commentsRoutes.delete("/delete/:id", protectedRoute, deleteComment);

commentsRoutes.put("/update/:id/:postId", protectedRoute, updateComment);



module.exports = commentsRoutes;
