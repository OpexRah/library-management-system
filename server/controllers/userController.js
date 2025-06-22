import Books from "../models/booksModel.js";
import IssueRequests from "../models/issueRequestsModel.js";
import IssueHistory from "../models/issueHistoryModel.js";
import IssuedBooks from "../models/issuedBooksModel.js";
import User from "../models/userModel.js";

export const requestBook = async (req, res, next) => {
    try {
        const book_id = req.body.book_id;
        const duration = req.body.duration;

        if (!book_id || !duration) {
            const error = new Error("Both book id and duration is required");
            error.status = 400;
            return next(error);
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            const error = new Error("User not found");
            error.status = 404;
            return next(error);
        }

        if (user.pending_fine > 0) {
            const error = new Error(
                "You have pending fines. Clear them before requesting a book."
            );
            error.status = 403;
            return next(error);
        }

        const book = await Books.findById(book_id);
        if (book.deleted) {
            const error = new Error("This book is not available");
            error.status = 404;
            return next(error);
        }

        const existingRequest = await IssueRequests.findOne({
            issuer: req.user.id,
            book_id: book_id,
        });

        if (existingRequest) {
            const error = new Error("You have already requested this book.");
            error.status = 409; // Conflict
            return next(error);
        }

        const newRequest = IssueRequests({
            issuer: req.user.id,
            book_id: book._id,
            duration,
        });

        await newRequest.save();

        const newHistory = IssueHistory({
            book_id: book._id,
            issuer_id: req.user.id,
        });

        await newHistory.save();
        return res.status(201).json({
            message: "Book request submitted successfully",
            request: newRequest,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const viewIssuedBooks = async (req, res, next) => {
    try {
        const books = await IssuedBooks.find({
            issuer_id: req.user.id,
        }).populate("book_id", "title author");
        res.status(200).json(books);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const viewPrevIssuedBooks = async (req, res, next) => {
    try {
        const history = await IssueHistory.find({
            issuer_id: req.user.id,
        }).populate("book_id", "title author");
        res.status(200).json(history);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const viewRejectedRequests = async (req, res, next) => {
    try {
        const rejected = await IssueHistory.find({
            issuer_id: req.user.id,
            approval: { $ne: "approved" },
        }).populate("book_id", "title author");
        res.status(200).json(rejected);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const payFines = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            const error = new Error("User not found");
            error.status = 404;
            return next(error);
        }

        if (!user.pending_fine || user.pending_fine <= 0) {
            return res.status(400).json({ message: "No pending fines to pay" });
        }
        user.pending_fine = 0;
        await user.save();

        res.status(200).json({ message: "Fine paid successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const profile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            const error = new Error("User not found");
            error.status = 404;
            return next(error);
        }

        const pendingFines = user.pending_fine;
        const username = user.username;

        const totalIssued = await IssueHistory.countDocuments({
            issuer_id: userId,
        });

        const currentlyIssued = await IssuedBooks.countDocuments({
            issuer_id: userId,
        });

        return res.status(200).json({
            username,
            pending_fine: pendingFines,
            total_issued_books: totalIssued,
            currently_issued_books: currentlyIssued,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
