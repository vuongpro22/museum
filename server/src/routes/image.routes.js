const express = require("express");
const multer = require("multer");
const imageController = require("../controllers/image.controller");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.get("/", imageController.getAllImages);
router.get("/search", imageController.searchImages);
router.get("/:id", imageController.getImageById);
router.post("/upload", upload.single("file"), imageController.uploadImage);
router.put("/:id", upload.single("file"), imageController.updateImage);
router.delete("/:id", imageController.deleteImage);

module.exports = router;
