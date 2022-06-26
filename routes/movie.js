const router = require("express").Router();
const Movie = require("../models/Movie");
const ApiError = require("../error/api-error");
const verifyToken = require("../middlewares/verifyToken");
const verifyAdminOrOwner = require("../middlewares/verifyAdmin");
const verifyAdmin = require("../middlewares/verifyAdmin");

router.get("/", async (req, res, next) => {
  try {
    const movies = await Movie.find();
    res.send(movies);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const movie = await Movie.findById({ _id: req.params.id });
    if (!movie) throw ApiError.notFound("no such movie");

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
