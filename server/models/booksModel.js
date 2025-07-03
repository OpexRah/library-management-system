import mongoose from "mongoose";

const booksSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        author: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            default: 0,
        },
        deleted: {
            type: Boolean,
            default: false,
        },
        coverImage: { type: String },
        bookPdf: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model("Books", booksSchema);
