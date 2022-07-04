const router = require("express").Router();
const User = require("../models/User");
const ApiError = require("../error/api-error");
const verifyToken = require("../middlewares/verifyToken");
const { hashPassword } = require("../lib/userSecurity");
const verifyAdminOrOwner = require("../middlewares/verifyAdminOrOwner");
const fs = require("fs");

// get all users
router.get("/", async (req, res, next) => {
  if (req.query.userId || req.query.username) {
    const userId = req.query.userId;
    const userName = req.query.username;
    try {
      const user = userId
        ? await User.findById(userId)
        : await User.findOne({ userName: userName });
      const { password, updatedAt, ...other } = user._doc;
      res.status(200).json(other);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    try {
      const users = await User.find();
      res.send(users);
    } catch (error) {
      next(error);
    }
  }
});

// get last 5 users registered
router.get("/latest", verifyToken, async (req, res) => {
  const query = req.query.new;
  if (req.user.isAdmin) {
    try {
      const users = query
        ? await User.find().sort({ _id: -1 }).limit(5)
        : await User.find();
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You are not allowed to see all users!");
  }
});

// get number of users registered last year
router.get("/stats", verifyToken, async (req, res) => {
  const today = new Date();
  const latYear = today.setFullYear(today.setFullYear() - 1);

  try {
    const data = await User.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

// // get user by id
// router.get("/:id", verifyToken, async (req, res, next) => {
//   try {
//     const user = await User.findOne({ _id: req.params.id });

//     if (!user) throw ApiError.notFound("no such user");
//     res.send(user);
//   } catch (error) {
//     next(error);
//   }
// });

// search for user
router.post("/search", verifyToken, async (req, res, next) => {
  try {
    const userName = req.body.userName;
    const users = await User.find({
      userName: { $regex: ".*" + userName + ".*" },
    }).limit(10);
    res.send(users);
  } catch (error) {
    next(error);
  }
});

// edit user
router.patch("/:id", verifyToken, async (req, res, next) => {
  try {
    if (req.body.password)
      req.body.password = await hashPassword(req.body.password);

    if (req.body.profilePicture) {
      fs.unlink(`./public/images/${req.body.oldProfilePicture}`, (err) => {
        if (err) console.log(err);
      });
    }

    if (req.body.coverPicture) {
      fs.unlink(`./public/images/${req.body.oldCoverPicture}`, (err) => {
        if (err) console.log(err);
      });
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.send(updatedUser);
  } catch (error) {
    next(error);
  }
});

// delete user
router.delete(
  "/:id",
  verifyToken,
  verifyAdminOrOwner,
  async (req, res, next) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.send({ isSuccess: true });
    } catch (error) {
      next(error);
    }
  }
);

//get friends
router.get("/friends/:userId", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const friends = await Promise.all(
      user.followings.map((friendId) => {
        return User.findById(friendId);
      })
    );
    let friendList = [];
    friends.map((friend) => {
      const { _id, userName, profilePicture } = friend;
      friendList.push({ _id, userName, profilePicture });
    });
    res.status(200).json(friendList);
  } catch (err) {
    res.status(500).json(err);
  }
});

//follow a user
router.put("/:id/follow", verifyToken, async (req, res) => {
  req.body.userId = req.user.id;
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json("user has been followed");
      } else {
        res.status(403).json("you already follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant follow yourself");
  }
});

//unfollow a user
router.put("/:id/unfollow", verifyToken, async (req, res) => {
  req.body.userId = req.user.id;
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("user has been unfollowed");
      } else {
        res.status(403).json("you dont follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant unfollow yourself");
  }
});

module.exports = router;
