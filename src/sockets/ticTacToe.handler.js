import { activeGames } from "./activeGames.js";
import * as tttService from "../modules/tic-tac-toe/tic-tac-toe.service.js";

const registerTicTacToeHandlers = (io, socket) => {
    const userId = socket.user?.id;
    if (!userId) return;

    // start game
    socket.on("ttt:start", async (data) => {
        try {
            const { roomCode } = data || {};

            if (!roomCode) {
                throw new Error("Room code is required");
            }

            const roomKey = `room:${roomCode}`;

            // check if game already exists
            if (activeGames.has(roomKey)) {
                throw new Error("Game already started in this room");
            }

            // get room
            const room = io.sockets.adapter.rooms.get(roomKey);

            if (!room) {
                throw new Error("Room not found");
            }

            // collect unique player ids
            const playerIds = [
                ...new Set(
                    [...room]
                        .map(socketId => io.sockets.sockets.get(socketId)?.user?.id)
                        .filter(Boolean)
                )
            ];

            if (playerIds.length !== 2) {
                throw new Error("Need exactly 2 players to start");
            }

            const game = tttService.createGame(playerIds);

            activeGames.set(roomKey, game);

            io.to(roomKey).emit("ttt:started", {
                game
            });
        } catch (error) {
            socket.emit("ttt:error", {
                message: error.message
            });
        }
    });

    // make move
    socket.on("ttt:move", async (data) => {
        try {
            const { roomCode, position } = data || {};

            if (!roomCode) {
                throw new Error("Room code is required");
            }

            const roomKey = `room:${roomCode}`;

            const game = activeGames.get(roomKey);

            if (!game) {
                throw new Error("No active game in this room");
            }

            const newGame = tttService.makeMove(
                game,
                userId,
                position
            );

            activeGames.set(roomKey, newGame);

            io.to(roomKey).emit("ttt:update", {
                game: newGame
            });
        } catch (error) {
            socket.emit("ttt:error", {
                message: error.message
            });
        }
    });

    // restart game
    socket.on("ttt:restart", async (data) => {
        try {
            const { roomCode } = data || {};

            if (!roomCode) {
                throw new Error("Room code is required");
            }

            const roomKey = `room:${roomCode}`;

            const game = activeGames.get(roomKey);

            if (!game) {
                throw new Error("No active game in this room");
            }

            if (!game.players.includes(userId)) {
                throw new Error("Only players can restart the game");
            }

            const newGame = tttService.restartGame(game);

            activeGames.set(roomKey, newGame);

            io.to(roomKey).emit("ttt:restarted", {
                game: newGame
            });
        } catch (error) {
            socket.emit("ttt:error", {
                message: error.message
            });
        }
    });
};

export default registerTicTacToeHandlers;