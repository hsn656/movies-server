const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");
const verifyToken = require("../middlewares/verifyToken");
const verifyAdminOrOwner = require("../middlewares/verifyAdmin");
const verifyAdmin = require("../middlewares/verifyAdmin");
const mongoose = require("mongoose");
const fs = require("fs");

//create a post
router.post("/", verifyToken, async (req, res, next) => {
  try {
    req.body.userId = req.user.id;
    const newPost = new Post(req.body);
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    next(err);
  }
});

//update a post
router.put("/:id", verifyToken, async (req, res, next) => {
  try {
    req.body.userId = req.user.id;
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("the post has been updated");
    } else {
      res.status(403).json("you can only update your post");
    }
  } catch (err) {
    next(err);
  }
});

//delete a post
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    req.body.userId = req.user.id;
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      if (post.img) {
        await fs.unlink(`./public/images/${post.img}`, (err) => {
          if (err) console.log(err);
        });
      }
      await post.deleteOne();
      res.status(200).json("the post has been deleted");
    } else {
      res.status(403).json("you can delete only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//like / dislike a post
router.put("/:id/like", verifyToken, async (req, res) => {
  try {
    req.body.userId = req.user.id;
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("The post has been liked");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("The post has been disliked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//get a post
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get timeline posts
router.get("/timeline/:userId", verifyToken, async (req, res) => {
  try {
    // req.body.userId = req.user.id;
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    let followingPosts = [];
    let otherPosts = [];
    if (currentUser.followings.length > 0) {
      //get following posts
      followingPosts = await Post.find({
        userId: { $in: currentUser.followings },
      });
      // otherPosts = await Promise.all(
      //   currentUser.followings.map((friendId) => {
      //     return Post.find({ userId: friendId });
      //   })
      // );
    } else {
      otherPosts = await Post.find({ userId: { $ne: currentUser._id } }).limit(
        5
      );
    }

    if (followingPosts.length + userPosts.length < 5) {
      otherPosts = await Post.find({
        userId: { $nin: [currentUser._id, ...currentUser.followings] },
      }).limit(5 - followingPosts.length);
    }

    res.json(userPosts.concat(...followingPosts).concat(...otherPosts));
  } catch (err) {
    res.status(500).json(err);
  }
});

//get user's posts
router.get("/profile/:userName", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ userName: req.params.userName });
    const posts = await Post.find({ userId: user._id });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
