const router = require("express").Router();
const verifyToken = require("../middlewares/verifyToken");
const User = require("../models/User");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/Order");
const mongoose = require("mongoose");

router.post("/", verifyToken, async (req, res, next) => {
  try {
    const { amount, source } = req.body;

    // await stripe.paymentIntents.create({
    //   amount,
    //   currency: "USD",
    //   description: "Your Company Description",
    //   payment_method: source,
    //   confirm: true,
    // });

    const charge = await stripe.charges.create({
      amount,
      currency: "usd",
      source,
    });

    const session = await mongoose.startSession();
    session.startTransaction();
    const order = new Order({
      user: req.user.id,
      price: amount,
    });
    await order.save({ session });

    const user = await User.findById(req.user.id);

    user.subscribedTill = new Date(
      new Date().getTime() + 30 * 24 * 60 * 60 * 1000
    );
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ isSuccess: true });
  } catch (error) {
    res.send(error);
  }
});

//is user subscribed
router.get("/isSubscribed", verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.subscribedTill > new Date()) {
      res.status(200).json({ isSubscribed: true });
    } else {
      res.status(200).json({ isSubscribed: false });
    }
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
