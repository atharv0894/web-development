// ---- AUDIO ASSETS ----
let xSound = new Audio("https://playtictactoe.org/assets/audio/note-low.mp3");
let oSound = new Audio("https://playtictactoe.org/assets/audio/note-high.mp3");
let tieSound = new Audio(
  "https://playtictactoe.org/assets/audio/game-over-tie.mp3"
);
let winSound = new Audio(
  "https://playtictactoe.org/assets/audio/game-over.mp3"
);

// ---- GAME STATE ----
let gameOver = false;
let turn = "X";
let gameMode = "human";
let isComputerTurn = false;

const changeTurn = () => (turn === "X" ? "O" : "X");

// ---- AI ENGINE ----
const getAvailableMoves = () => {
  let boxtexts = document.getElementsByClassName("boxtext");
  let available = [];
  for (let i = 0; i < 9; i++) {
    if (boxtexts[i].innerText === "") available.push(i);
  }
  return available;
};

const evaluateBoard = () => {
  let boxtexts = document.getElementsByClassName("boxtext");
  let wins = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let e of wins) {
    if (
      boxtexts[e[0]].innerText !== "" &&
      boxtexts[e[0]].innerText === boxtexts[e[1]].innerText &&
      boxtexts[e[1]].innerText === boxtexts[e[2]].innerText
    ) {
      return boxtexts[e[0]].innerText === "O" ? 10 : -10;
    }
  }
  return 0;
};

const minimax = (depth, isMaximizing) => {
  let score = evaluateBoard();
  if (score === 10) return score - depth;
  if (score === -10) return score + depth;
  let availableMoves = getAvailableMoves();
  if (availableMoves.length === 0) return 0;

  if (isMaximizing) {
    let best = -1000;
    for (let move of availableMoves) {
      let boxtexts = document.getElementsByClassName("boxtext");
      boxtexts[move].innerText = "O";
      best = Math.max(best, minimax(depth + 1, false));
      boxtexts[move].innerText = "";
    }
    return best;
  } else {
    let best = 1000;
    for (let move of availableMoves) {
      let boxtexts = document.getElementsByClassName("boxtext");
      boxtexts[move].innerText = "X";
      best = Math.min(best, minimax(depth + 1, true));
      boxtexts[move].innerText = "";
    }
    return best;
  }
};

const getBestMove = () => {
  let availableMoves = getAvailableMoves();
  let bestValue = -1000;
  let bestMove = availableMoves[0];
  for (let move of availableMoves) {
    let boxtexts = document.getElementsByClassName("boxtext");
    boxtexts[move].innerText = "O";
    let moveValue = minimax(0, false);
    boxtexts[move].innerText = "";
    if (moveValue > bestValue) {
      bestValue = moveValue;
      bestMove = move;
    }
  }
  return bestMove;
};

// ---- COMPUTER MOVE (HUMAN-LIKE) ----
const makeComputerMove = () => {
  if (gameMode === "computer" && !gameOver && isComputerTurn) {
    let boxtexts = document.getElementsByClassName("boxtext");
    let availableMoves = getAvailableMoves();
    let move;

    // DIFFICULTY: Set to 0.6 (60% perfect, 40% random) so humans can win
    let skillLevel = 0.6;

    if (Math.random() < skillLevel) {
      move = getBestMove(); // Play smart
    } else {
      move = availableMoves[Math.floor(Math.random() * availableMoves.length)]; // Play like a human (random)
    }

    if (boxtexts[move].innerText === "") {
      boxtexts[move].innerText = "O";
      oSound.play();
      checkWin();

      if (!gameOver) {
        if (getAvailableMoves().length === 0) {
          document.querySelector(".turnInfo").innerText = "Match Draw 🤝";
          tieSound.play();
          gameOver = true;
          return;
        }
        isComputerTurn = false;
        turn = "X";
        document.querySelector(".turnInfo").innerText = "Your turn (X)";
      }
    }
  }
};

// ---- WIN CHECK ----
const checkWin = () => {
  let boxtexts = document.getElementsByClassName("boxtext");
  let wins = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  wins.forEach((e) => {
    if (
      boxtexts[e[0]].innerText !== "" &&
      boxtexts[e[0]].innerText === boxtexts[e[1]].innerText &&
      boxtexts[e[1]].innerText === boxtexts[e[2]].innerText
    ) {
      document.querySelector(".turnInfo").innerText =
        boxtexts[e[0]].innerText + " Won 🎉";
      document.querySelector(".turnInfo").classList.add("winner-text");
      [e[0], e[1], e[2]].forEach((i) =>
        boxtexts[i].parentElement.classList.add("win-animation")
      );
      winSound.play();
      gameOver = true;
    }
  });
};

// ---- USER CLICKS ----
let boxes = document.getElementsByClassName("box");
Array.from(boxes).forEach((element) => {
  let boxtext = element.querySelector(".boxtext");
  element.addEventListener("click", () => {
    // block click if it's the computer's turn or box is full
    if (boxtext.innerText === "" && !gameOver && !isComputerTurn) {
      boxtext.innerText = turn;

      // Add click animation to the box
      element.classList.add("clicked");
      setTimeout(() => {
        element.classList.remove("clicked");
      }, 400);

      turn === "X" ? xSound.play() : oSound.play();
      checkWin();

      if (!gameOver) {
        if (getAvailableMoves().length === 0) {
          document.querySelector(".turnInfo").innerText = "Match Draw 🤝";
          tieSound.play();
          gameOver = true;
          return;
        }
        turn = changeTurn();
        if (gameMode === "computer" && turn === "O") {
          isComputerTurn = true;
          document.querySelector(".turnInfo").innerText =
            "Computer thinking...";

          // Thinking delay: 800ms
          setTimeout(() => {
            makeComputerMove();
          }, 800);
        } else {
          document.querySelector(".turnInfo").innerText = "Turn for " + turn;
        }
      }
    }
  });
});

// ---- CONTROLS ----
document.getElementById("modeToggleBtn").addEventListener("click", (e) => {
  gameMode = gameMode === "human" ? "computer" : "human";
  e.target.textContent = `Mode: ${
    gameMode === "human" ? "Human vs Human" : "Computer vs Human"
  }`;
  resetGame();
});

document.getElementById("reset").addEventListener("click", () => resetGame());

const resetGame = () => {
  document.querySelectorAll(".boxtext").forEach((box) => {
    box.innerText = "";
    box.parentElement.classList.remove("win-animation");
  });
  document.querySelector(".turnInfo").classList.remove("winner-text");
  turn = "X";
  gameOver = false;
  isComputerTurn = false;
  document.querySelector(".turnInfo").innerText =
    gameMode === "computer" ? "Your turn (X)" : "Turn for X";
};
