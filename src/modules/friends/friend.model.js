import mongoose from "mongoose";

const friendSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "pending",
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

friendSchema.index({ sender: 1, receiver: 1 });

export default mongoose.model("Friend", friendSchema);