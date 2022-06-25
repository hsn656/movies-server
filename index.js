const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

mongoose.connect(process.env.DB_URL).then(() => {
  app.listen(process.env.PORT || 8800, () => {
    console.log("listening on port 8800");
  });
});
