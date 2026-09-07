const chessboard = document.getElementById("chessboard");
const turnText = document.getElementById("turn");

let selectedSquare = null;
let currentPlayer = "white";

const board = [
  ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
  ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
  ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"],
];

function createBoard() {
  chessboard.innerHTML = "";

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement("div");

      square.classList.add("square");

      if ((row + col) % 2 === 0) {
        square.classList.add("white-square");
      } else {
        square.classList.add("black-square");
      }

      square.textContent = board[row][col];

      square.dataset.row = row;
      square.dataset.col = col;

      square.addEventListener("click", () => {
        squareClicked(row, col);
      });

      chessboard.appendChild(square);
    }
  }
}

function squareClicked(row, col) {
  const piece = board[row][col];

  // Hvis vi ikke allerede har valgt en brik
  if (selectedSquare === null) {
    // Der skal være en brik på feltet
    if (piece === "") {
      return;
    }

    // Man må kun vælge sin egen farve
    if (currentPlayer === "white" && isBlackPiece(piece)) {
      return;
    }

    if (currentPlayer === "black" && isWhitePiece(piece)) {
      return;
    }

    selectedSquare = {
      row: row,
      col: col,
    };

    createBoard();
    highlightSelectedSquare();

    return;
  }

  // Vi har allerede valgt en brik
  const fromRow = selectedSquare.row;
  const fromCol = selectedSquare.col;

  const selectedPiece = board[fromRow][fromCol];

  // Undgå at slå sine egne brikker
  if (piece !== "" && isWhitePiece(selectedPiece) === isWhitePiece(piece)) {
    selectedSquare = null;
    createBoard();
    return;
  }

  // Tjek om trækket er lovligt
  if (isLegalMove(fromRow, fromCol, row, col)) {
    board[row][col] = selectedPiece;
    board[fromRow][fromCol] = "";

    changeTurn();
  }

  selectedSquare = null;

  createBoard();
}

function isLegalMove(fromRow, fromCol, toRow, toCol) {
  const piece = board[fromRow][fromCol];

  // Vi starter med kun at implementere bønder
  if (piece === "♙" || piece === "♟") {
    return isLegalPawnMove(fromRow, fromCol, toRow, toCol);
  }

  // De andre brikker må stadig flyttes frit
  // indtil vi implementerer deres regler
  return true;
}

function isLegalPawnMove(fromRow, fromCol, toRow, toCol) {
  const piece = board[fromRow][fromCol];

  const direction = piece === "♙" ? -1 : 1;

  const startRow = piece === "♙" ? 6 : 1;

  const targetPiece = board[toRow][toCol];

  // BONDE GÅR 1 FELT FREM
  if (
    toCol === fromCol &&
    toRow === fromRow + direction &&
    targetPiece === ""
  ) {
    return true;
  }

  // BONDE GÅR 2 FELTER FRA START
  if (
    toCol === fromCol &&
    fromRow === startRow &&
    toRow === fromRow + direction * 2 &&
    targetPiece === "" &&
    board[fromRow + direction][fromCol] === ""
  ) {
    return true;
  }

  // BONDE SLÅR DIAGONALT
  if (
    Math.abs(toCol - fromCol) === 1 &&
    toRow === fromRow + direction &&
    targetPiece !== "" &&
    isWhitePiece(piece) !== isWhitePiece(targetPiece)
  ) {
    return true;
  }

  return false;
}

function changeTurn() {
  if (currentPlayer === "white") {
    currentPlayer = "black";
    turnText.textContent = "Sorte's tur";
  } else {
    currentPlayer = "white";
    turnText.textContent = "Hvids tur";
  }
}

function isWhitePiece(piece) {
  return ["♔", "♕", "♖", "♗", "♘", "♙"].includes(piece);
}

function isBlackPiece(piece) {
  return ["♚", "♛", "♜", "♝", "♞", "♟"].includes(piece);
}

function highlightSelectedSquare() {
  const squares = document.querySelectorAll(".square");

  squares.forEach((square) => {
    const row = Number(square.dataset.row);
    const col = Number(square.dataset.col);

    if (row === selectedSquare.row && col === selectedSquare.col) {
      square.classList.add("selected");
    }
  });
}

createBoard();
