const Image = require("../models/image.model");
const {
  uploadBuffer,
  deleteByPublicId
} = require("../services/cloudinary.service");

function parsePosition(positionValue) {
  if (positionValue === undefined || positionValue === null || positionValue === "") {
    return undefined;
  }

  const parsed = Number.parseInt(positionValue, 10);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return parsed;
}

function normalizeImage(doc) {
  const image = doc.toObject({ versionKey: false });
  delete image._id;
  return image;
}

async function getAllImages(_req, res) {
  const images = await Image.find().sort({ position: 1, id: 1 });
  res.json(images.map(normalizeImage));
}

async function getImageById(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "Invalid image id" });
  }

  const image = await Image.findOne({ id });
  if (!image) {
    return res.status(404).json({ message: "Image not found" });
  }

  res.json(normalizeImage(image));
}

async function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "File is required" });
  }

  if (!req.file.mimetype || !req.file.mimetype.startsWith("image/")) {
    return res.status(400).json({ message: "File must be an image" });
  }

  const { title, description = "" } = req.body;
  const position = parsePosition(req.body.position);

  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  if (position === null) {
    return res.status(400).json({ message: "Position must be a number" });
  }

  const uploaded = await uploadBuffer(req.file.buffer);

  let image = null;
  if (position !== undefined) {
    image = await Image.findOne({ position });
  }

  if (image) {
    image.title = title;
    image.description = description;
    image.cloudinaryUrl = uploaded.secure_url;
    image.cloudinaryPublicId = uploaded.public_id;
  } else {
    image = new Image({
      title,
      description,
      position,
      cloudinaryUrl: uploaded.secure_url,
      cloudinaryPublicId: uploaded.public_id
    });
  }

  await image.save();
  res.status(201).json(normalizeImage(image));
}

async function updateImage(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "Invalid image id" });
  }

  const image = await Image.findOne({ id });
  if (!image) {
    return res.status(404).json({ message: "Image not found" });
  }

  const position = parsePosition(req.body.position);
  if (position === null) {
    return res.status(400).json({ message: "Position must be a number" });
  }

  if (position !== undefined && position !== image.position) {
    const conflict = await Image.findOne({ position });
    if (conflict && conflict.id !== image.id) {
      await Image.deleteOne({ id: conflict.id });
    }
    image.position = position;
  }

  if (req.body.title !== undefined) {
    image.title = req.body.title;
  }

  if (req.body.description !== undefined) {
    image.description = req.body.description;
  }

  if (req.file) {
    if (!req.file.mimetype || !req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({ message: "File must be an image" });
    }

    const uploaded = await uploadBuffer(req.file.buffer);
    const oldPublicId = image.cloudinaryPublicId;
    image.cloudinaryUrl = uploaded.secure_url;
    image.cloudinaryPublicId = uploaded.public_id;
    await deleteByPublicId(oldPublicId);
  }

  await image.save();
  res.json(normalizeImage(image));
}

async function deleteImage(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "Invalid image id" });
  }

  const image = await Image.findOne({ id });
  if (!image) {
    return res.status(404).json({ message: "Image not found" });
  }

  await Image.deleteOne({ id });
  res.json({ message: "Image deleted successfully" });
}

async function searchImages(req, res) {
  const title = req.query.title || "";
  const images = await Image.find({
    title: { $regex: title, $options: "i" }
  }).sort({ position: 1, id: 1 });
  res.json(images.map(normalizeImage));
}

module.exports = {
  getAllImages,
  getImageById,
  uploadImage,
  updateImage,
  deleteImage,
  searchImages
};
