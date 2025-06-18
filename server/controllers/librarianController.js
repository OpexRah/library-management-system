import IssueRequests from "../models/issueRequestsModel.js";
import IssuedBooks from "../models/issuedBooksModel.js";
import IssueHistory from "../models/issueHistoryModel.js";
import Books from "../models/booksModel.js";
import User from "../models/userModel.js";

export const viewIssueRequests = async (req, res, next) => {
    try {
        const userAuthority = req.user.role;

        if (userAuthority !== "admin" && userAuthority !== "librarian") {
            const error = new Error("Not authorized to delete books");
            error.status = 403;
            return next(error);
        }

        const requests = await IssueRequests.find()
            .populate("issuer", "username book_issued")
            .populate("book_id", "title author quantity");

        if (requests.length === 0) {
            const error = new Error("No pending requests found");
            error.status = 404;
            return next(error);
        }
        res.status(200).json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const approveRequest = async (req, res, next) => {
    try {
        const userAuthority = req.user.role;

        if (userAuthority !== "admin" && userAuthority !== "librarian") {
            const error = new Error("Not authorized to delete books");
            error.status = 403;
            return next(error);
        }

        const { request_id, fine_amount } = req.body;
        if (!request_id || !fine_amount) {
            const error = new Error(
                "Enter request ID and fine amount to approve"
            );
            error.status = 400;
            return next(error);
        }

        const requestDetails = await IssueRequests.findById(
            request_id
        ).populate("book_id");
        if (!requestDetails) {
            const error = new Error("Request not found");
            error.status = 404;
            return next(error);
        }

        if (requestDetails.book_id.quantity <= 0) {
            const error = new Error("No more books available");
            error.status = 400;
            return next(error);
        }

        const issueDate = new Date();
        const expectedReturn = new Date(
            issueDate.getTime() + requestDetails.duration * 24 * 60 * 60 * 1000
        );

        const issued = new IssuedBooks({
            book_id: requestDetails.book_id._id,
            issuer_id: requestDetails.issuer,
            duration: requestDetails.duration,
            expected_return: expectedReturn,
            fine: fine_amount,
        });

        await issued.save();

        const updatedHistory = await IssueHistory.findOneAndUpdate(
            {
                book_id: requestDetails.book_id._id,
                issuer_id: requestDetails.issuer,
                approval: "pending",
            },
            {
                approval: "approved",
                issue_date: issueDate,
                return_date: expectedReturn,
            },
            { new: true }
        );

        if (!updatedHistory) {
            const error = new Error(
                "Matching history entry not found to update"
            );
            error.status = 404;
            return next(error);
        }

        requestDetails.book_id.quantity -= 1;
        await requestDetails.book_id.save();

        await IssueRequests.findByIdAndDelete(request_id);

        return res.status(200).json({
            message: "Request approved, book issued, and history updated",
            issued,
            history: updatedHistory,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const rejectRequest = async (req, res, next) => {
    try {
        const userAuthority = req.user.role;
        if (userAuthority !== "admin" && userAuthority !== "librarian") {
            return next(
                new Error("Not authorized to reject book requests", {
                    status: 403,
                })
            );
        }

        const { request_id, reason } = req.body;

        if (!request_id) {
            return next(new Error("Request ID is required", { status: 400 }));
        }

        const requestDetails = await IssueRequests.findById(request_id);
        if (!requestDetails) {
            return next(new Error("Request not found", { status: 404 }));
        }

        const updatedHistory = await IssueHistory.findOneAndUpdate(
            {
                book_id: requestDetails.book_id,
                issuer_id: requestDetails.issuer,
                approval: "pending",
            },
            {
                approval: reason?.trim() || "rejected",
            },
            { new: true }
        );

        if (!updatedHistory) {
            return next(
                new Error("Matching history entry not found to update", {
                    status: 404,
                })
            );
        }

        await IssueRequests.findByIdAndDelete(request_id);

        return res.status(200).json({
            message: "Request rejected and history updated",
            history: updatedHistory,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const viewAllIssuedBooks = async (req, res, next) => {
    try {
        const userAuthority = req.user.role;

        if (userAuthority !== "admin" && userAuthority !== "librarian") {
            const error = new Error("Not authorized to view issued books");
            error.status = 403;
            return next(error);
        }

        const allIssued = await IssuedBooks.find()
            .populate("book_id", "title author")
            .populate("issuer_id", "username");
        if (!allIssued) {
            return next(new Error("No books issued", { status: 404 }));
        }

        res.status(200).json(allIssued);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const viewDefaulters = async (req, res, next) => {
    try {
        const userAuthority = req.user.role;

        if (userAuthority !== "admin" && userAuthority !== "librarian") {
            const error = new Error("Not authorized to view defaulters");
            error.status = 403;
            return next(error);
        }

        const today = new Date();

        const defaulters = await IssuedBooks.find({
            expected_return: { $lt: today },
        })
            .populate("book_id", "title author")
            .populate("issuer_id", "username");

        if (defaulters.length === 0) {
            return res.status(200).json({ message: "No defaulters found" });
        }

        res.status(200).json(defaulters);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const markReturned = async (req, res, next) => {
    try {
        const userAuthority = req.user.role;

        if (userAuthority !== "admin" && userAuthority !== "librarian") {
            const error = new Error("Not authorized to view defaulters");
            error.status = 403;
            return next(error);
        }

        const { book_id, issuer_id } = req.body;
        if (!book_id || !issuer_id) {
            const error = new Error("Need both book_id and issuer_id");
            error.status = 403;
            return next(error);
        }
        const issued_book = await IssuedBooks.findOne({
            book_id: book_id,
            issuer_id: issuer_id,
        });

        if (!issued_book) {
            const error = new Error("User hasn't issued any book");
            error.status = 403;
            return next(error);
        }

        const fine_rate = issued_book.fine;
        const today = Date.now();
        const dueDate = new Date(issued_book.expected_return);
        const msInDay = 1000 * 60 * 60 * 24;
        const diffDays = Math.ceil((today - dueDate) / msInDay);
        const fine = diffDays > 0 ? diffDays * fine_rate : 0;
        console.log(fine);
        if (fine > 0) {
            await User.findByIdAndUpdate(
                issuer_id,
                { $inc: { pending_fine: fine } },
                { new: true }
            );
        }

        await IssuedBooks.findByIdAndDelete(issued_book._id);
        await Books.findByIdAndUpdate(book_id, { $inc: { quantity: 1 } });
        await IssueHistory.findOneAndUpdate(
            {
                book_id,
                issuer_id,
                approval: "returned",
            },
            {
                return_date: today,
            }
        );
        res.status(200).json({
            message: "Book marked as returned",
            fine: fine,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
