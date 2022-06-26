const express = require("express");
const authRouter = require("./auth");
const userRouter = require("./user");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("hello");
});

router.use("/auth", authRouter);
router.use("/users", userRouter);

module.exports = router;
