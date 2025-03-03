const board = document.getElementById("board");
const turnIndicator = document.getElementById("turn-indicator");
const winnerBox = document.getElementById("winner-box");
const winnerMessage = document.getElementById("winner-message");
const errorMessage = document.getElementById("error-message");
const setupContainer = document.querySelector(".setup-container");

let gameMode;
let player1, player2;
let currentPlayer;
let gameActive;
let boardState = ["", "", "", "", "", "", "", "", ""];
let playerSymbol;
let aiSymbol;
let difficulty = null;

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function chooseMode(mode) {
    gameMode = mode;
    setupContainer.classList.remove("hidden");
    setupContainer.style.opacity = "0";
    setTimeout(() => {
        setupContainer.style.transition = "opacity 0.5s ease-in-out";
        setupContainer.style.opacity = "1";
    }, 10);
    document.getElementById("player2").classList.toggle("hidden", mode === "ai");
}

function chooseXO(symbol) {
    playerSymbol = symbol;
    aiSymbol = symbol === "X" ? "O" : "X";
    document.getElementById("xo-selection").classList.add("hidden");
    if (gameMode === "ai") {
        document.getElementById("difficulty-selection").classList.remove("hidden");
    }
}

function setDifficulty(diff) {
    difficulty = diff;
    const buttons = document.querySelectorAll('.difficulty-button');
    buttons.forEach(button => {
        if (button.dataset.difficulty === diff) {
            button.classList.add('selected-difficulty');
        } else {
            button.classList.remove('selected-difficulty');
        }
    });
}

function startGame() {
    player1 = document.getElementById("player1").value || "";
    player2 = gameMode === "friend" ? document.getElementById("player2").value || "" : "AI";

    if ((gameMode === "friend" && (!player1 || !player2)) || (gameMode === "ai" && (!player1 || !difficulty))) {
        errorMessage.classList.remove("hidden");
        errorMessage.style.opacity = "0";
        setTimeout(() => {
            errorMessage.style.transition = "opacity 0.3s ease-in-out";
            errorMessage.style.opacity = "1";
        }, 10);
        return;
    }
    errorMessage.style.opacity = "1";
    errorMessage.style.transition = "opacity 0.3s ease-in-out";
    errorMessage.style.opacity = "0";
    setTimeout(()=> errorMessage.classList.add("hidden"),300)

    document.getElementById("welcome-screen").classList.add("hidden");
    document.getElementById("game-screen").classList.remove("hidden");

    currentPlayer = playerSymbol;
    gameActive = true;
    boardState.fill("");
    board.innerHTML = "";

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.index = i;
        cell.addEventListener("click", handleCellClick);
        board.appendChild(cell);
    }

    updateTurnIndicator();

    if (gameMode === "ai" && currentPlayer === aiSymbol) {
        setTimeout(aiMove, 500);
    }
}

function handleCellClick(event) {
    const index = event.target.dataset.index;

    if (boardState[index] !== "" || !gameActive) return;

    boardState[index] = currentPlayer;
    event.target.innerText = currentPlayer;

    if (checkWinner()) {
        gameActive = false;
        const winnerName = currentPlayer === playerSymbol ? player1 : player2;
        setTimeout(() => showWinner(`${winnerName} Wins! 🎉`), 500);
    } else if (!boardState.includes("")) {
        gameActive = false;
        setTimeout(() => showWinner("It's a Draw!"), 500);
    } else {
        currentPlayer = currentPlayer === playerSymbol ? aiSymbol : playerSymbol;
        updateTurnIndicator();

        if (gameMode === "ai" && currentPlayer === aiSymbol) {
            setTimeout(aiMove, 500);
        }
    }
}

function aiMove() {
    let move;
    if (difficulty === 'easy') {
        move = easyAIMove();
    } else if (difficulty === 'medium') {
        move = mediumAIMove();
    } else {
        move = hardAIMove();
    }
    board.children[move].click();
}

function easyAIMove() {
    let emptyCells = boardState.map((val, idx) => (val === "" ? idx : null)).filter((val) => val !== null);
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function mediumAIMove() {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (boardState[a] === aiSymbol && boardState[b] === aiSymbol && boardState[c] === "") return c;
        if (boardState[a] === aiSymbol && boardState[c] === aiSymbol && boardState[b] === "") return b;
        if (boardState[b] === aiSymbol && boardState[c] === aiSymbol && boardState[a] === "") return a;
        if (boardState[a] === playerSymbol && boardState[b] === playerSymbol && boardState[c] === "") return c;
        if (boardState[a] === playerSymbol && boardState[c] === playerSymbol && boardState[b] === "") return b;
        if (boardState[b] === playerSymbol && boardState[c] === playerSymbol && boardState[a] === "") return a;
    }
    return easyAIMove();
}

function hardAIMove() {
    return minimax(boardState, aiSymbol).index;
}

function minimax(newBoard, player) {
    let availSpots = newBoard.map((val, idx) => val === "" ? idx : null).filter(val => val !== null);

    if (checkWin(newBoard, playerSymbol)) {
        return { score: -10 };
    } else if (checkWin(newBoard, aiSymbol)) {
        return { score: 10 };
    } else if (availSpots.length === 0) {
        return { score: 0 };
    }

    let moves = [];
    for (let i = 0; i < availSpots.length; i++) {
        let move = {};
        move.index = availSpots[i];
        newBoard[availSpots[i]] = player;

        if (player === aiSymbol) {
            let result = minimax(newBoard, playerSymbol);
            move.score = result.score;
        } else {
            let result = minimax(newBoard, aiSymbol);
            move.score = result.score;
        }

        newBoard[availSpots[i]] = "";
        moves.push(move);
    }

    let bestMove;
    if (player === aiSymbol) {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}

function checkWin(board, player) {
    return winningConditions.some(([a, b, c]) =>
        board[a] === player && board[b] === player && board[c] === player
    );
}
function checkWinner() {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (boardState[a] !== "" && boardState[a] === boardState[b] && boardState[b] === boardState[c]) {
            // Add the winning-cell class to the winning cells
            board.children[a].classList.add("winning-cell");
            board.children[b].classList.add("winning-cell");
            board.children[c].classList.add("winning-cell");
            return true;
        }
    }
    return false;
}

function playAgain() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach(cell => cell.classList.remove("winning-cell"));

    winnerBox.classList.add("hidden");
    startGame();
}

function showWinner(message) {
    winnerMessage.innerText = message;
    winnerBox.classList.remove("hidden");
    confettiBoom();
}

function playAgain() {
    const winningLine = document.getElementById("winning-line");
    winningLine.classList.add("hidden"); 
    winningLine.style.width = "0"; 
    winnerBox.classList.add("hidden");
    startGame();
}

function confettiBoom() {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const interval = setInterval(() => {
        if (Date.now() > animationEnd) {
            clearInterval(interval);
            return;
        }
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }, 250);
}

function updateTurnIndicator() {
    turnIndicator.innerText = `${currentPlayer === playerSymbol ? player1 : player2}'s Turn`;
}

function startOver() {
    location.reload();
}