const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");

dotenv.config();

const router = require("./routes");
const apiErrorHandler = require("./error/api-error-handler");

//new
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/images", express.static(path.join(__dirname, "public/images")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});
const upload = multer({ storage: storage });

app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    return res.status(200).json("File uploded successfully");
  } catch (error) {
    console.error(error);
  }
});

app.use("/", router);
app.use(apiErrorHandler);

mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    app.listen(process.env.PORT || 8800, () => {
      console.log("listening on port 8800");
    });
  })
  .catch((err) => {
    console.log(err);
  });

//new
