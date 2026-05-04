const express = require("express");
const musicController = require("../controllers/music.controller");

const router = express.Router();

router.get("/", musicController.getMusicTracks);
router.post("/sync", musicController.syncMusic);

module.exports = router;
