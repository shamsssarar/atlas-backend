import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import { AppRoutes } from "./app/routes";

const app: Express = express();
// Middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      "https://atlas-frontend-sooty.vercel.app",
      "http://localhost:3000",
    ], // Add your frontend production URL here
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1", AppRoutes);

// Health Check Route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", message: "Atlas Backend is running" });
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
