import Books from "../models/booksModel.js";

export const books = async (req, res, next) => {
    try {
        const all_books = await Books.find({ deleted: false });
        if (!all_books) {
            const error = new Error("No books found");
            error.status = 404;
            return next(error);
        }
        res.status(200).json(all_books);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const addBook = async (req, res, next) => {
    try {
        const { title, author, quantity } = req.body;
        if (!title || !author || !quantity) {
            const error = new Error("Title, Author and quantity are required");
            error.status = 400;
            return next(error);
        }

        const userAuthority = req.user.role;
        if (userAuthority !== "admin" && userAuthority !== "librarian") {
            const error = new Error("Not authorized to add books");
            error.status = 403;
            return next(error);
        }

        const newBook = new Books({ title, author, quantity });
        const savedBook = await newBook.save();

        res.status(201).json({
            message: "Book added successfully",
            book: savedBook,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const editBook = async (req, res, next) => {
    try {
        const { title, author, quantity } = req.body;
        const bookId = req.params.bookid;

        const userAuthority = req.user.role;
        if (userAuthority !== "admin" && userAuthority !== "librarian") {
            const error = new Error("Not authorized to edit books");
            error.status = 403;
            return next(error);
        }

        if (!title && !author && quantity === undefined) {
            const error = new Error(
                "At least one of title, author, or quantity must be provided"
            );
            error.status = 400;
            return next(error);
        }

        const book = await Books.findById(bookId);
        if (!book) {
            const error = new Error(`Book with id: ${bookId} not found`);
            error.status = 404;
            return next(error);
        }

        if (title) book.title = title;
        if (author) book.author = author;
        if (quantity !== undefined) {
            if (isNaN(quantity) || quantity < 0) {
                const error = new Error(
                    "Quantity must be a non-negative number"
                );
                error.status = 400;
                return next(error);
            }
            book.quantity = quantity;
        }

        const savedBook = await book.save();
        res.status(200).json({
            message: "Book updated successfully",
            book: savedBook,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteBook = async (req, res, next) => {
    try {
        const bookId = req.params.bookid;
        const userAuthority = req.user.role;

        if (userAuthority !== "admin" && userAuthority !== "librarian") {
            const error = new Error("Not authorized to delete books");
            error.status = 403;
            return next(error);
        }

        const book = await Books.findById(bookId);
        if (!book) {
            const error = new Error(`Book with id: ${bookId} not found`);
            error.status = 404;
            return next(error);
        }

        book.deleted = true;
        await book.save();

        res.status(200).json({
            message: "Book deleted successfully (soft delete)",
            book,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const searchBook = async (req, res, next) => {
    try {
        const { query } = req.query;
        if (!query || query.trim() === "") {
            const error = new Error("Search query is required");
            error.status = 400;
            return next(error);
        }

        const searchRegex = new RegExp(query, "i");

        const books = await Books.find({
            deleted: false,
            $or: [
                { title: { $regex: searchRegex } },
                { author: { $regex: searchRegex } },
            ],
        });

        if (!books || books.length === 0) {
            return res.status(404).json({ message: "No matching books found" });
        }

        res.status(200).json(books);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
