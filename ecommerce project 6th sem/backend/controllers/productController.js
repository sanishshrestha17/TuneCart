import Product from "../models/Product.js";

export const addProduct = async (req, res) => {
  const product = await Product.create(req.body);
  res.json(product);
};

export const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(product);
};

export const deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted" });
};

export const getProducts = async (req, res) => {
  const products = await Product.find({ name: { $regex: req.query.search || "", $options: "i" } });
  res.json(products);
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---- NEW: Reviews ----

export const addReview = async (req, res) => {
  const { rating, comment } = req.body;
  if (!rating || !comment)
    return res.status(400).json({ message: "Rating and comment are required" });
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user.id.toString()
    );
    if (alreadyReviewed)
      return res.status(400).json({ message: "You already reviewed this product" });

    product.reviews.push({
      user: req.user.id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    });
    product.numReviews = product.reviews.length;
    product.averageRating =
      product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ message: "Review added" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const review = product.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.user.toString() !== req.user.id.toString() && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorized" });

    review.deleteOne();
    product.numReviews = product.reviews.length;
    product.averageRating = product.reviews.length
      ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
      : 0;

    await product.save();
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getRecommendations = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select("category");
    if (!product) return res.status(404).json({ message: "Product not found" });

    const recommendations = await Product.find({
      _id: { $ne: req.params.id },        // exclude current product
      category: product.category,          // same category only
    })
    .select("-reviews")                    // don't send reviews, saves bandwidth
    .lean();                               // plain JS objects, faster

    // Sort by score: averageRating × log(numReviews + 1)
    const scored = recommendations
      .map(p => ({
        ...p,
        score: (p.averageRating || 0) * Math.log((p.numReviews || 0) + 1),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);                        // top 4 only

    res.json(scored);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getTrending = async (req, res) => {
  try {
    const products = await Product.find({ stock: { $gt: 0 } })
      .select("-reviews")
      .lean();

    const scored = products
      .map(p => ({
        ...p,
        trendingScore: (p.averageRating * 0.6) + (Math.log((p.numReviews || 0) + 1) * 0.4),
      }))
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, 4); // top 4 trending

    res.json(scored);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};