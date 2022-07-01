const router = require("express").Router();
const User = require("../models/User");
const ApiError = require("../error/api-error");
const verifyToken = require("../middlewares/verifyToken");
const { hashPassword } = require("../lib/userSecurity");
const verifyAdminOrOwner = require("../middlewares/verifyAdminOrOwner");

router.get("/", async (req, res, next) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (error) {
    next(error);
  }
});

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

router.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id });

    if (!user) throw ApiError.notFound("no such user");
    res.send(user);
  } catch (error) {
    next(error);
  }
});

// search for user
router.post("/search", async (req, res, next) => {
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

router.patch(
  "/:id",
  verifyToken,
  verifyAdminOrOwner,
  async (req, res, next) => {
    try {
      if (req.body.password)
        req.body.password = await hashPassword(req.body.password);

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      res.send(updatedUser);
    } catch (error) {
      next(error);
    }
  }
);

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

module.exports = router;
