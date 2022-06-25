const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const router = require("./routes");
const apiErrorHandler = require("./error/api-error-handler");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

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
