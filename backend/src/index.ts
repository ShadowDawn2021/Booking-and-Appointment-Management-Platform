// src/index.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./routes/authRoutes.js";
import { config } from "./utils/config.js";

//routes
import { providerRouter } from "./routes/providerRoutes.js";
import { serviceRouter } from "./routes/serviceRoutes.js";
import { availabilityRouter } from "./routes/availabilityRoutes.js";
import { bookingRouter } from "./routes/bookingRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/providers", providerRouter);
app.use("/api/services", serviceRouter);
app.use(errorHandler); // must be registered after all routes
app.use("/api/availability", availabilityRouter);
app.use("/api/bookings", bookingRouter);

app.get("/", (req, res) => res.json({ status: "ok" }));
app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(config.port, () =>
  console.log(`Server running on port ${config.port}`),
);
