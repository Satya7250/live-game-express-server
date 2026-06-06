import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["private", "group", "room", "game"],
            default: "private",
            required: true,
        },
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            }
        ],
        lastMessage: {
            type: String,
            trim: true,
            default: null,
        },
        lastMessageSender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        lastMessageAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

conversationSchema.index({
    participants: 1,
    updatedAt: -1,
});

export default mongoose.model("Conversation", conversationSchema);
