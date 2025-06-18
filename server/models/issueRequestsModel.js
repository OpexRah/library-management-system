import mongoose, { Mongoose } from "mongoose";

const issueRequestsSchema = mongoose.Schema(
    {
        issuer: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true,
        },
        book_id: {
            type: mongoose.Types.ObjectId,
            ref: "Books",
            required: true,
        },
        duration: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("IssueRequests", issueRequestsSchema);
