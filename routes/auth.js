const router = require("express").Router();
const User = require("../models/User");
const ApiError = require("../error/api-error");
const {
  hashPassword,
  generateToken,
  isPasswordValid,
} = require("../lib/userSecurity");

router.post("/register", async (req, res, next) => {
  try {
    const alreadyRegisterUser = await User.findByEmail(req.body.email);
    if (alreadyRegisterUser) {
      throw ApiError.badRequest("email already exists");
    }

    const hashedPassword = await hashPassword(req.body.password);

    const newUser = new User({
      userName: req.body.userName,
      email: req.body.email,
      password: hashedPassword,
    });

    const user = await newUser.save();
    const token = await generateToken(newUser);

    res.send({ user, token });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const user = await User.findByEmail(req.body.email);
    if (!user) {
      throw ApiError.badRequest("email or password is incorrect");
    }

    const isValid = await isPasswordValid(req.body.password, user);

    if (!isValid) {
      throw ApiError.badRequest("email or password is incorrect");
    }

    const token = await generateToken(user);

    res.send({ user, token });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
