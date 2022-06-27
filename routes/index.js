const express = require("express");
const authRouter = require("./auth");
const userRouter = require("./user");
const movieRouter = require("./movie");
const listRouter = require("./lists");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("hello");
});

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/movies", movieRouter);
router.use("/lists", listRouter);

module.exports = router;
