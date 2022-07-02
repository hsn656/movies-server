const router = require("express").Router();
const verifyToken = require("../middlewares/verifyToken");
const User = require("../models/User");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/Order");
const mongoose = require("mongoose");

router.post("/", verifyToken, async (req, res, next) => {
  try {
    const { amount, source } = req.body;
    const charge = await stripe.charges.create({
      amount,
      currency: "usd",
      source,
    });

    const session = await mongoose.startSession();
    session.startTransaction();
    await Order.create(
      {
        user: req.user._id,
        price: amount,
      },
      { session }
    );
    await User.findByIdAndUpdate(
      req.user._id,
      {
        subscribedTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ isSuccess: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
