const router = require("express").Router();
const Movie = require("../models/Movie");
const ApiError = require("../error/api-error");
const verifyToken = require("../middlewares/verifyToken");
const verifyAdminOrOwner = require("../middlewares/verifyAdmin");
const verifyAdmin = require("../middlewares/verifyAdmin");
const mongoose = require("mongoose");
const User = require("../models/User");

router.get("/", verifyToken, async (req, res, next) => {
  try {
    const movies = await Movie.find();
    res.send(movies);
  } catch (error) {
    next(error);
  }
});

//search movies by title
router.post("/search", verifyToken, async (req, res, next) => {
  try {
    const movies = await Movie.find({
      title: { $regex: req.body.search, $options: "i" },
    });
    res.send(movies);
  } catch (error) {
    next(error);
  }
});

router.get("/random", verifyToken, async (req, res) => {
  const type = req.query.type;
  let movie;
  try {
    if (type === "series") {
      movie = await Movie.aggregate([
        { $match: { isSeries: true } },
        { $sample: { size: 1 } },
      ]);
    } else {
      movie = await Movie.aggregate([
        { $match: { isSeries: false } },
        { $sample: { size: 1 } },
      ]);
    }
    res.status(200).json(movie);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/:id", verifyToken, async (req, res, next) => {
  try {
    const movie = await Movie.findById({ _id: req.params.id });
    if (!movie) throw ApiError.notFound("no such movie");

    res.send(movie);
  } catch (error) {
    next(error);
  }
});

// user likes movie
// push movie in user.likes and push user in movie.likes
router.post("/:id/like", verifyToken, async (req, res, next) => {
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    const movie = await Movie.findById({ _id: req.params.id });
    if (!movie) throw ApiError.notFound("no such movie");
    if (movie.likes.includes(req.user.id))
      throw ApiError.conflict("movie already liked");
    movie.likes.push(req.user.id);
    await movie.save({ session });
    const user = await User.findById({ _id: req.user.id });
    if (user.likes.includes(movie._id))
      throw ApiError.conflict("user already liked");
    user.likes.push(movie._id);
    await user.save({ session });
    await session.commitTransaction();
    session.endSession();
    res.send(movie);
  } catch (error) {
    next(error);
  }
});

// user unlike movie
// remove movie from user.likes and remove user from movie.likes
router.delete("/:id/like", verifyToken, async (req, res, next) => {
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    const movie = await Movie.findById({ _id: req.params.id });
    if (!movie) throw ApiError.notFound("no such movie");
    if (!movie.likes.includes(req.user.id))
      throw ApiError.conflict("movie not liked");
    movie.likes.pull(req.user.id);
    await movie.save({ session });
    const user = await User.findById({ _id: req.user.id });
    if (!user.likes.includes(movie._id))
      throw ApiError.conflict("user not liked");
    user.likes.pull(movie._id);
    await user.save({ session });
    await session.commitTransaction();
    session.endSession();
    res.send(movie);
  } catch (error) {
    next(error);
  }
});

router.post("/", verifyToken, verifyAdmin, async (req, res, next) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json(movie);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", verifyToken, verifyAdmin, async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.send(movie);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", verifyToken, verifyAdmin, async (req, res, next) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);
    res.send({ isSuccess: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
