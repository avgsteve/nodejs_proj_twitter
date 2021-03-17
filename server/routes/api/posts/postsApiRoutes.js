const express = require('express');
const router = express.Router();
const authController = require('./../auth/authController')
const {
  getAllPosts,
  createPost,
  getPostById,
  deletePost,
  updatePost,
  likePost,
  createRetweetPost
} = require('./postsApiControllers');

// router : host/api/posts/(sub router)

router.get("/", getAllPosts);

router.use(authController.restrictToSignedInUser);

// CRUD
router.post("/", createPost);
router.get("/:postId", getPostById);
router.put("/:postId", updatePost);
router.delete("/:postId", deletePost);

// Like and retweet a post
router.put("/:postId/like", likePost);
router.post("/:postId/retweet", createRetweetPost);

module.exports = router;