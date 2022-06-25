const express = require("express");
const authRouter = require("./auth");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("hello");
});

router.use("/auth", authRouter);

module.exports = router;
