function errorMiddleware(err, _req, res, _next) {
  console.error(err);

  if (err && err.name === "MulterError") {
    return res.status(400).json({ message: err.message });
  }

  if (err && err.name === "MongoServerError" && err.code === 11000) {
    return res.status(409).json({ message: "Duplicate field value" });
  }

  res.status(500).json({ message: err.message || "Internal server error" });
}

module.exports = errorMiddleware;
