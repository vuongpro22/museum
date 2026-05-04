const { v2: cloudinary } = require("cloudinary");

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Missing Cloudinary env vars. Required: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET"
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });
}

function uploadBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "museum-images", resource_type: "image" },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      }
    );

    stream.end(buffer);
  });
}

async function deleteByPublicId(publicId) {
  if (!publicId) {
    return;
  }
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}

async function listMp3Resources() {
  const prefix = process.env.CLOUDINARY_MUSIC_PREFIX || "";
  const resources = [];
  let nextCursor;

  do {
    const response = await cloudinary.api.resources({
      resource_type: "video",
      type: "upload",
      max_results: 500,
      prefix: prefix || undefined,
      next_cursor: nextCursor
    });

    const current = response.resources || [];
    resources.push(...current);
    nextCursor = response.next_cursor;
  } while (nextCursor);

  return resources.filter((item) => {
    const format = (item.format || "").toLowerCase();
    const url = (item.secure_url || "").toLowerCase();
    return format === "mp3" || url.endsWith(".mp3");
  });
}

module.exports = {
  configureCloudinary,
  uploadBuffer,
  deleteByPublicId,
  listMp3Resources
};
