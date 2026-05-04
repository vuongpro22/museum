const MusicTrack = require("../models/music-track.model");
const { listMp3Resources } = require("../services/cloudinary.service");

function displayNameFromPublicId(publicId) {
  const value = publicId.split("/").pop() || publicId;
  return value.replace(/[-_]/g, " ");
}

function normalizeTrack(doc) {
  const track = doc.toObject({ versionKey: false });
  delete track._id;
  return track;
}

async function syncMusicFromCloudinary() {
  const cloudinaryTracks = await listMp3Resources();
  const activePublicIds = [];

  for (let index = 0; index < cloudinaryTracks.length; index += 1) {
    const item = cloudinaryTracks[index];
    const publicId = item.public_id;
    activePublicIds.push(publicId);

    await MusicTrack.updateOne(
      { publicId },
      {
        $set: {
          name: displayNameFromPublicId(publicId),
          url: item.secure_url,
          publicId,
          format: (item.format || "mp3").toLowerCase(),
          bytes: item.bytes,
          duration: item.duration,
          order: index,
          isActive: true
        }
      },
      { upsert: true }
    );
  }

  if (activePublicIds.length > 0) {
    await MusicTrack.updateMany(
      { publicId: { $nin: activePublicIds } },
      { $set: { isActive: false } }
    );
  } else {
    await MusicTrack.updateMany({}, { $set: { isActive: false } });
  }

  return cloudinaryTracks.length;
}

async function getMusicTracks(req, res) {
  const shouldSync = req.query.sync === "true";
  let tracks = await MusicTrack.find({ isActive: true }).sort({ order: 1, createdAt: 1 });

  if (shouldSync || tracks.length === 0) {
    await syncMusicFromCloudinary();
    tracks = await MusicTrack.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
  }

  res.json(tracks.map(normalizeTrack));
}

async function syncMusic(req, res) {
  const total = await syncMusicFromCloudinary();
  res.json({ message: "Music synchronized", total });
}

module.exports = {
  getMusicTracks,
  syncMusic
};
