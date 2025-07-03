import express from "express";
import {
    books,
    addBook,
    editBook,
    deleteBook,
    searchBook,
} from "../controllers/booksController.js";
import protect from "../middlewares/protectRoute.js";
import { upload } from "../middlewares/upload.js";
import multer from "multer";

const router = express.Router();

router.get("/", books);
router.post(
    "/new",
    (req, res, next) => {
        upload.fields([
            { name: "coverImage", maxCount: 1 },
            { name: "bookPdf", maxCount: 1 },
        ])(req, res, function (err) {
            if (err) {
                // An unknown error occurred
                console.error("Unknown upload error:", err);
                return res.status(500).json({ message: err.message });
            }
            next();
        });
    },
    protect,
    addBook
);

router.put("/edit/:bookid", protect, editBook);
router.delete("/delete/:bookid", protect, deleteBook);
router.get("/search", searchBook);

export default router;
