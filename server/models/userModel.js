import mongoose from "mongoose";

const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        role: {
            type: String,
            default: "user",
        },
        pending_fine: {
            type: Number,
            default: 0,
        },
        refreshToken: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

export default mongoose.model("User", userSchema);
