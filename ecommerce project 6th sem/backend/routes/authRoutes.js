import express from "express";
import { signup, login } from "../controllers/authController.js";


const router = express.Router();

router.post("/register", signup);  // ← changed from /signup to /register
router.post("/login", login);

export default router;