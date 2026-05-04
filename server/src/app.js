require("dotenv").config();
require("express-async-errors");

const express = require("express");
const cors = require("cors");

const { connectDatabase } = require("./config/database");
const { configureCloudinary } = require("./services/cloudinary.service");
const imageRoutes = require("./routes/image.routes");
const musicRoutes = require("./routes/music.routes");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();
const port = Number.parseInt(process.env.PORT || "8080", 10);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/images", imageRoutes);
app.use("/api/music", musicRoutes);
app.use(errorMiddleware);

async function startServer() {
  configureCloudinary();
  await connectDatabase();

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error("Unable to start server", error);
  process.exit(1);
});
