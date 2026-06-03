import "dotenv/config";
import http from "http";

import app from "./src/app.js";
import connectDB from "./src/common/config/db.js";
import { initializeSocket } from "./src/common/config/socket.js";

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);
    initializeSocket(server);

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();