import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import { addProduct, updateProduct, deleteProduct, getProducts, getProductById, addReview, deleteReview, getRecommendations, getTrending } from "../controllers/productController.js";

const router = express.Router();

router.get("/trending", getTrending);  
router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", protect, isAdmin, addProduct);
router.put("/:id", protect, isAdmin, updateProduct);
router.delete("/:id", protect, isAdmin, deleteProduct);
router.post("/:id/reviews", protect, addReview);
router.delete("/:id/reviews/:reviewId", protect, deleteReview);
router.get("/:id/recommendations", getRecommendations);  

export default router;