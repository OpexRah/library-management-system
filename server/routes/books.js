import express from "express";
import {
    books,
    addBook,
    editBook,
    deleteBook,
    searchBook,
} from "../controllers/booksController.js";
import protect from "../middlewares/protectRoute.js";

const router = express.Router();

router.get("/", books);
router.post("/new", protect, addBook);
router.put("/edit/:bookid", protect, editBook);
router.delete("/delete/:bookid", protect, deleteBook);
router.get("/search", searchBook);

export default router;
