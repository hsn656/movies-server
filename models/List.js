const mongoose = require("mongoose");

const ListSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      required: true,
    },
    genre: {
      type: String,
      required: true,
    },
    isSeries: {
      type: Boolean,
      default: true,
    },
    content: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("List", ListSchema);
