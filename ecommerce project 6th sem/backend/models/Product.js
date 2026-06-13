import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  image: String,
  stock: Number,
  category: String, 
  reviews: [reviewSchema],
  numReviews: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
});

export default mongoose.model("Product", productSchema);