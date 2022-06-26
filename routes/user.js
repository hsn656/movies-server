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

router.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id });

    if (!user) throw ApiError.notFound("no such user");
    res.send(user);
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
