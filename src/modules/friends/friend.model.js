import mongoose from "mongoose";

const friendSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "pending",
            required: true,
        },
        // Normalized user pair to prevent (A→B) and (B→A) duplicates
        userPair: {
            type: [mongoose.Schema.Types.ObjectId],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

friendSchema.pre("validate", function () {
    this.userPair = [this.sender, this.receiver].sort((a, b) =>
        a.toString().localeCompare(b.toString())
    );
});

friendSchema.index(
    { userPair: 1, status: 1 },
    {
        unique: true,
        partialFilterExpression: { status: { $in: ["pending", "accepted"] } }
    }
);

friendSchema.index({ sender: 1, status: 1 });
friendSchema.index({ receiver: 1, status: 1 });

export default mongoose.model("Friend", friendSchema);
