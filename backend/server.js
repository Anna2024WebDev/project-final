import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";
import crypto from "crypto";
import bcrypt from "bcrypt-nodejs";
import playgroundRoutes from "./routes/playground-routes";

dotenv.config();

const mongoUrl =
  process.env.MONGO_URL || "mongodb://localhost/project-playground";
mongoose.connect(mongoUrl);
mongoose.Promise = Promise;

const port = process.env.PORT || 9000;
const app = express();

app.use(cors());
app.use(express.json());

//middleware for authentication
const authenticateUser = async (req, res, next) => {
  try {
    const user = await User.findOne({
      accessToken: req.header("Authorization"),
    });
    if (user) {
      req.user = user;
      next();
    } else {
      res
        .status(401)
        .json({ loggedOut: true, message: "Invalid access token" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Use the playground routes
app.use("/api/playgrounds", playgroundRoutes); // Routes for playgrounds

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

//Query openstreetAPI

// [out:json][timeout:25];
// node["leisure"="playground"](59.0,17.5,60.2,19.0);
// out body;
