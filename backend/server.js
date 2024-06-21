import express from "express";
import mongoose from "mongoose";
import path from "path";
import dotenv from "dotenv";
import userRouter from "./routes/userRoutes.js";
import cors from "cors";

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    tlsInsecure: true,
  })
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.error("Error connecting to db", err.message);
  });

const app = express();

// Enable CORS for all routes
app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests from this origin
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
    credentials: true, // Allow cookies to be sent
  })
);

app.options("*", cors()); // Handle preflight requests

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRouter);

const __dirname = path.resolve();
app.use(
  express.static(path.join(__dirname, "/frontend/my-new-react-app/build"))
);
app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "/frontend/my-new-react-app/build/index.html")
  );
});

// Define error handler for express
app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});

const port = process.env.PORT || 9000;
app.listen(port, () => {
  console.log(`serve at http://localhost:${port}`);
});
