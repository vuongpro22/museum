const mongoose = require("mongoose");
const Counter = require("./counter.model");

const imageSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      unique: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    cloudinaryUrl: {
      type: String,
      required: true
    },
    cloudinaryPublicId: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ""
    },
    position: {
      type: Number,
      unique: true,
      sparse: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

imageSchema.pre("save", async function assignIncrementId(next) {
  if (!this.isNew || this.id) {
    return next();
  }

  const counter = await Counter.findByIdAndUpdate(
    "imageId",
    { $inc: { seq: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  this.id = counter.seq;
  next();
});

module.exports = mongoose.model("Image", imageSchema);
