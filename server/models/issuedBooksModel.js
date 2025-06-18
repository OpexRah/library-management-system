import mongoose from "mongoose";

const issuedBooksSchema = new mongoose.Schema(
    {
        book_id: {
            type: mongoose.Types.ObjectId,
            ref: "Books",
            required: true,
        },
        issuer_id: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true,
        },
        duration: {
            type: Number,
            required: true,
        },
        expected_return: {
            type: Date,
            required: true,
        },
        fine: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("IssuedBooks", issuedBooksSchema);
