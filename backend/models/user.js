import mongoose from "mongoose";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    match: [/\S+@\S+\.\S+/, "Please enter a valid email address"],
    lowercase: true,
    trim: true, // this trims whitespaces around the email
  },
  password: {
    type: String,
    required: true,
    minlength: [8, 'Password must be at least 8 characters long'],
  },
  accessToken: {
    type: String,
    default: () => crypto.randomBytes(128).toString("hex"),
  },
  savedPlaygrounds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Playground' }],
});

export const User = mongoose.model("User", userSchema);
