import express from "express";
import {
    login,
    signUp,
    logout,
    refresh,
    createLibrarian,
    validate,
} from "../controllers/authController.js";
import protect from "../middlewares/protectRoute.js";

const router = express.Router();
router.post("/login", login);
router.post("/signup", signUp);
router.post("/logout", protect, logout);
router.post("/refresh", refresh);
router.post("/librarian", protect, createLibrarian);
router.post("/validate", protect, validate);

export default router;
