const express = require("express");
const authRouter = require("./auth");
const userRouter = require("./user");
const movieRouter = require("./movie");
const listRouter = require("./lists");
const postRouter = require("./posts");
const paymentRouter = require("./payment");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("hello");
});

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/movies", movieRouter);
router.use("/lists", listRouter);
router.use("/posts", postRouter);
router.use("/payment", paymentRouter);

module.exports = router;
