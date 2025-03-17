import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { router } from "./routes/playground-routes";
import { router as userRouter } from "./routes/user-routes";

dotenv.config();

const mongoUrl =
  process.env.MONGO_URL || "mongodb://localhost/project-playground";
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((error) => console.log("Error connecting to MongoDB Atlas:", error));
if (!mongoUrl) {
  throw new Error("MONGO_URL is not defined");
}

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      poolSize: 10, //Connection pooling, maintaining a pool of open database connections that can be reused rather than creating a new connection each time one is needed.
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

//  Call the function to connect to MongoDB before starting the server
connectToMongoDB();

const port = process.env.PORT || 9000;
const app = express();

app.use(cors());
app.use(express.json());

// This will prefix all the routes in playgroundRoutes with /api/playgrounds and /user
app.use("/api/playgrounds", router);
app.use("/user", userRouter);

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
