import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "user" },
  address: {
    fullName: { type: String, default: "" },
    street:   { type: String, default: "" },
    city:     { type: String, default: "" },
    phone:    { type: String, default: "" },
  }
});

export default mongoose.model("User", userSchema);