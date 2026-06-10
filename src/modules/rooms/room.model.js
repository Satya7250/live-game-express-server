import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        roomCode: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        players: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
            ],
            default: [],
        },
        maxPlayers: {
            type: Number,
            required: true,
            min: 2,
            max: 10,
        },
        status: {
            type: String,
            enum: ["waiting", "playing", "finished"],
            default: "waiting",
            required: true,
        },
        gameType: {
            type: String,
            enum: ["tic-tac-toe", "rock-paper-scissors"],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

roomSchema.index({ owner: 1 });
roomSchema.index({ players: 1 });
roomSchema.index({ status: 1 });

// Pre-save hook to prevent duplicate players
roomSchema.pre("save", function () {
    // Convert ObjectIds to strings for comparison
    const uniquePlayers = [
        ...new Set(this.players.map((playerId) => playerId.toString())),
    ].map((playerIdStr) => this.players.find(
        (playerId) => playerId.toString() === playerIdStr
    ));
    
    this.players = uniquePlayers;
});

export default mongoose.model("Room", roomSchema);
