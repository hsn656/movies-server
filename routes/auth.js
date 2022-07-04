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
      subscribedTill: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await newUser.save();
    const accessToken = await generateToken(newUser);

    res.send({ accessToken });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const user = await User.findOne(
      { email: req.body.email },
      {
        password: 1,
        isAdmin: 1,
        email: 1,
        _id: 1,
        subscribedTill: 1,
        subsribedTill: 1,
        followings: 1,
        userName: 1,
        subscribedTill: 1,
        likes: 1,
        profilePicture: 1,
        coverPicture: 1,
      }
    );
    if (!user) {
      throw ApiError.badRequest("email or password is incorrect");
    }

    const isValid = await isPasswordValid(req.body.password, user);

    if (!isValid) {
      throw ApiError.badRequest("email or password is incorrect");
    }

    const accessToken = await generateToken(user);
    const { password, ...userInfo } = user._doc;

    res.send({ ...userInfo, accessToken });
  } catch (error) {
    next(error);
  }
});

//check if email exists
router.post("/check-email", async (req, res, next) => {
  try {
    const user = await User.findByEmail(req.body.email);
    if (user) {
      res.send({ exists: true });
    } else {
      res.send({ exists: false });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
