import mongoose from "mongoose";

// add fine field here later
const issueHistorySchema = new mongoose.Schema(
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
        issue_date: {
            type: Date,
            required: true,
            default: Date.now,
        },
        return_status: {
            type: Boolean,
            default: false,
        },
        return_date: {
            type: Date,
            default: null,
        },
        approval: {
            type: String,
            default: "pending",
        },
    },
    { timestamps: true }
);

export default mongoose.model("IssueHistory", issueHistorySchema);
