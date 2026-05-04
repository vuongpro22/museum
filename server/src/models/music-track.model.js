const mongoose = require("mongoose");

const musicTrackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    format: {
      type: String,
      default: "mp3"
    },
    bytes: {
      type: Number
    },
    duration: {
      type: Number
    },
    order: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model("MusicTrack", musicTrackSchema);
