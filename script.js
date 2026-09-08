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
      if (isWhitePiece(board[row][col])) {
        square.classList.add("white-piece");
      } else if (isBlackPiece(board[row][col])) {
        square.classList.add("black-piece");
      }

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

  if (piece === "♖" || piece === "♜") {
    return isLegalRookMove(fromRow, fromCol, toRow, toCol);
  }

  if (piece === "♗" || piece === "♝") {
    return isLegalBishopMove(fromRow, fromCol, toRow, toCol);
  }

  if (piece === "♘" || piece === "♞") {
    return isLegalKnightMove(fromRow, fromCol, toRow, toCol);
  }

  if (piece === "♕" || piece === "♛") {
    return isLegalQueenMove(fromRow, fromCol, toRow, toCol);
  }
  // De andre brikker må stadig flyttes frit
  // indtil vi implementerer deres regler
  return true;
}
// Pawn
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

//Tårn

function isLegalRookMove(fromRow, fromCol, toRow, toCol) {
  // Tårnet skal enten flytte vandret
  // eller lodret

  const movingHorizontally = fromRow === toRow;
  const movingVertically = fromCol === toCol;

  if (!movingHorizontally && !movingVertically) {
    return false;
  }

  // Tjek om der står en brik i vejen
  if (movingHorizontally) {
    const direction = toCol > fromCol ? 1 : -1;

    for (let col = fromCol + direction; col !== toCol; col += direction) {
      if (board[fromRow][col] !== "") {
        return false;
      }
    }
  }

  if (movingVertically) {
    const direction = toRow > fromRow ? 1 : -1;

    for (let row = fromRow + direction; row !== toRow; row += direction) {
      if (board[row][fromCol] !== "") {
        return false;
      }
    }
  }

  return true;
}

// Løber

function isLegalBishopMove(fromRow, fromCol, toRow, toCol) {
  const rowDifference = Math.abs(toRow - fromRow);
  const colDifference = Math.abs(toCol - fromCol);

  // Løberen skal bevæge sig lige langt
  // i rækker og kolonner
  if (rowDifference !== colDifference) {
    return false;
  }

  // Find retningen
  const rowDirection = toRow > fromRow ? 1 : -1;
  const colDirection = toCol > fromCol ? 1 : -1;

  let row = fromRow + rowDirection;
  let col = fromCol + colDirection;

  // Tjek alle felter mellem start og slut
  while (row !== toRow && col !== toCol) {
    if (board[row][col] !== "") {
      return false;
    }

    row += rowDirection;
    col += colDirection;
  }

  return true;
}

// Springer

function isLegalKnightMove(fromRow, fromCol, toRow, toCol) {
  const rowDifference = Math.abs(toRow - fromRow);
  const colDifference = Math.abs(toCol - fromCol);

  // Springeren går:
  // 2 felter i én retning
  // og 1 felt til siden

  if (
    (rowDifference === 2 && colDifference === 1) ||
    (rowDifference === 1 && colDifference === 2)
  ) {
    return true;
  }

  return false;
}

function isLegalQueenMove(fromRow, fromCol, toRow, toCol) {
  // Er det et tårn-træk?
  const rookMove = isLegalRookMove(fromRow, fromCol, toRow, toCol);

  // Er det et løber-træk?

  const bishopMove = isLegalBishopMove(fromRow, fromCol, toRow, toCol);

  return rookMove || bishopMove;
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
