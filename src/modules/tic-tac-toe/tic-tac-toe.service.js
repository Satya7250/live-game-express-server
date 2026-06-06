const WINNING_LINES = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    [0, 4, 8],
    [2, 4, 6]
];

// create game
const createGame = (players) => {
    if (!Array.isArray(players) || players.length !== 2) {
        throw new Error("Game requires exactly 2 players");
    }

    if (new Set(players).size !== 2) {
        throw new Error("Players must be unique");
    }

    return {
        players,
        currentTurn: players[0],
        board: Array(9).fill(null),
        status: "playing",
        winner: null,
        winningLine: null,
        symbols: {
            [players[0]]: "X",
            [players[1]]: "O"
        }
    };
};

// check winner
const checkWinner = (board) => {
    for (const line of WINNING_LINES) {
        const [a, b, c] = line;

        if (
            board[a] &&
            board[a] === board[b] &&
            board[a] === board[c]
        ) {
            return {
                winner: board[a],
                line
            };
        }
    }

    return null;
};

// check draw
const checkDraw = (board) => {
    return board.every(cell => cell !== null);
};

// make move
const makeMove = (gameState, playerId, position) => {
    // validate player
    if (!gameState.players.includes(playerId)) {
        throw new Error("Invalid player");
    }

    // validate position
    if (
        !Number.isInteger(position) ||
        position < 0 ||
        position > 8
    ) {
        throw new Error("Invalid position");
    }

    // validate game status
    if (gameState.status !== "playing") {
        throw new Error("Game is not active");
    }

    // validate player turn
    if (gameState.currentTurn !== playerId) {
        throw new Error("Not your turn");
    }

    // validate cell
    if (gameState.board[position] !== null) {
        throw new Error("Cell already occupied");
    }

    const newBoard = [...gameState.board];
    newBoard[position] = gameState.symbols[playerId];

    let newStatus = "playing";
    let newWinner = null;
    let newWinningLine = null;

    const winnerResult = checkWinner(newBoard);

    if (winnerResult) {
        newStatus = "won";
        newWinner = playerId;
        newWinningLine = winnerResult.line;
    } else if (checkDraw(newBoard)) {
        newStatus = "draw";
    }

    const nextTurn = gameState.players.find(
        player => player !== playerId
    );

    return {
        ...gameState,
        board: newBoard,
        status: newStatus,
        winner: newWinner,
        winningLine: newWinningLine,
        currentTurn: nextTurn
    };
};

// restart game
const restartGame = (gameState) => {
    return createGame(gameState.players);
};

export {
    createGame,
    makeMove,
    checkWinner,
    checkDraw,
    restartGame
};