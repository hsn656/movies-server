const router = require("express").Router();
const List = require("../models/List");
const ApiError = require("../error/api-error");
const verifyToken = require("../middlewares/verifyToken");
const verifyAdminOrOwner = require("../middlewares/verifyAdmin");
const verifyAdmin = require("../middlewares/verifyAdmin");

// get all
router.get("/", verifyToken, async (req, res, next) => {
  try {
    const typeQuery = req.query.type;
    const genreQuery = req.query.genre;
    let list = [];
    if (typeQuery) {
      if (genreQuery) {
        list = await List.aggregate([
          { $sample: { size: 10 } },
          { $match: { type: typeQuery, genre: genreQuery } },
        ]);
      } else {
        list = await List.aggregate([
          { $sample: { size: 10 } },
          { $match: { type: typeQuery } },
        ]);
      }
    } else {
      list = await List.aggregate([{ $sample: { size: 10 } }]);
    }
    res.send(list);
  } catch (error) {
    next(error);
  }
});

// get one
router.get("/:id", verifyToken, async (req, res, next) => {
  try {
    const list = await List.findById({ _id: req.params.id });
    if (!list) throw ApiError.notFound("no such list");
    res.send(list);
  } catch (error) {
    next(error);
  }
});

// create one
router.post("/", verifyToken, verifyAdmin, async (req, res, next) => {
  try {
    const list = await List.create(req.body);
    res.status(201).json(list);
  } catch (error) {
    next(error);
  }
});

// edit
router.patch("/:id", verifyToken, verifyAdmin, async (req, res, next) => {
  try {
    const list = await List.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.send(list);
  } catch (error) {
    next(error);
  }
});

// delete
router.delete("/:id", verifyToken, verifyAdmin, async (req, res, next) => {
  try {
    await List.findByIdAndDelete(req.params.id);
    res.send({ isSuccess: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
