/// <reference path="./express.d.ts" />
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { config } from "./config";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import authRouter from "./routes/auth";
import newsRouter from "./routes/news";

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || config.isOriginAllowed(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/news", newsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Nuzio API listening on port ${config.port}`);
});
