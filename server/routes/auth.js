import express from "express";
import {
    login,
    signUp,
    logout,
    refresh,
    createLibrarian,
} from "../controllers/authController.js";
import protect from "../middlewares/protectRoute.js";

const router = express.Router();
router.post("/login", login);
router.post("/signup", signUp);
router.post("/logout", protect, logout);
router.post("/refresh", refresh);
router.post("/librarian", protect, createLibrarian);

export default router;
