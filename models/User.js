const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    profilePicture: {
      type: String,
      default:
        "https://media.istockphoto.com/vectors/default-profile-picture-avatar-photo-placeholder-vector-illustration-vector-id1223671392?k=20&m=1223671392&s=612x612&w=0&h=lGpj2vWAI3WUT1JeJWm1PRoHT3V15_1pdcTn2szdwQ0=",
    },
    coverPicture: {
      type: String,
      default: "https://static.xx.fbcdn.net/rsrc.php/v3/y4/r/DGeyGUHgoHO.png",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movie",
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    subsribedTill: {
      type: Date,
      required: true,
    },
    desc: {
      type: String,
      max: 50,
      default: "",
    },
  },
  { timestamps: true }
);

UserSchema.statics.findByEmail = function (email) {
  return this.findOne({ email });
};

module.exports = mongoose.model("User", UserSchema);
