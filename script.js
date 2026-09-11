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

// =====================================
// LAV SKAKBRÆT
// =====================================

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

// =====================================
// KLIK PÅ FELT
// =====================================

function squareClicked(row, col) {
  const piece = board[row][col];

  // Hvis ingen brik er valgt
  if (selectedSquare === null) {
    if (piece === "") {
      return;
    }

    // Hvid må kun vælge hvid
    if (currentPlayer === "white" && isBlackPiece(piece)) {
      return;
    }

    // Sort må kun vælge sort
    if (currentPlayer === "black" && isWhitePiece(piece)) {
      return;
    }

    selectedSquare = {
      row: row,
      col: col,
    };

    createBoard();
    highlightSelectedSquare();
    highlightPossibleMoves();

    return;
  }

  const fromRow = selectedSquare.row;
  const fromCol = selectedSquare.col;

  const selectedPiece = board[fromRow][fromCol];

  // Hvis man klikker på sin egen brik
  if (piece !== "" && isWhitePiece(selectedPiece) === isWhitePiece(piece)) {
    selectedSquare = null;

    createBoard();

    return;
  }

  // Er trækket lovligt?
  if (isLegalMove(fromRow, fromCol, row, col)) {
    // Lav en midlertidig kopi af brættet
    const oldBoard = copyBoard();

    board[row][col] = selectedPiece;
    board[fromRow][fromCol] = "";

    // Find ud af hvilken farve kongen har
    const playerColor = currentPlayer;

    // Må spilleren lave dette træk?
    if (isKingInCheck(playerColor)) {
      // Fortryd trækket
      restoreBoard(oldBoard);

      alert("Du må ikke sætte din egen konge i skak!");
    } else {
      changeTurn();

      // Tjek om modstanderen er i skak
      const opponent = currentPlayer === "white" ? "black" : "white";

      if (isCheckmate(opponent)) {
        turnText.textContent = "SKAKMAT!";

        alert("SKAKMAT! " + currentPlayer + " vinder!");
      } else if (isKingInCheck(opponent)) {
        turnText.textContent += " - SKAK!";

        alert("SKAK!");
      }
    }
  }

  selectedSquare = null;

  createBoard();
}

// =====================================
// LOVLIGE TRÆK
// =====================================

function isLegalMove(fromRow, fromCol, toRow, toCol) {
  const piece = board[fromRow][fromCol];
  if (fromRow === toRow && fromCol === toCol) {
    return false;
  }

  if (piece === "") {
    return false;
  }

  // BONDE
  if (piece === "♙" || piece === "♟") {
    return isLegalPawnMove(fromRow, fromCol, toRow, toCol);
  }

  // TÅRN
  if (piece === "♖" || piece === "♜") {
    return isLegalRookMove(fromRow, fromCol, toRow, toCol);
  }

  // LØBER
  if (piece === "♗" || piece === "♝") {
    return isLegalBishopMove(fromRow, fromCol, toRow, toCol);
  }

  // SPRINGER
  if (piece === "♘" || piece === "♞") {
    return isLegalKnightMove(fromRow, fromCol, toRow, toCol);
  }

  // DRONNING
  if (piece === "♕" || piece === "♛") {
    return isLegalQueenMove(fromRow, fromCol, toRow, toCol);
  }

  // KONGE
  if (piece === "♔" || piece === "♚") {
    return isLegalKingMove(fromRow, fromCol, toRow, toCol);
  }

  return false;
}

// =====================================
// BONDE
// =====================================

function isLegalPawnMove(fromRow, fromCol, toRow, toCol) {
  const piece = board[fromRow][fromCol];

  const direction = piece === "♙" ? -1 : 1;

  const startRow = piece === "♙" ? 6 : 1;

  const targetPiece = board[toRow][toCol];

  // Ét felt frem
  if (
    toCol === fromCol &&
    toRow === fromRow + direction &&
    targetPiece === ""
  ) {
    return true;
  }

  // To felter fra start
  if (
    toCol === fromCol &&
    fromRow === startRow &&
    toRow === fromRow + direction * 2 &&
    targetPiece === "" &&
    board[fromRow + direction][fromCol] === ""
  ) {
    return true;
  }

  // Slå diagonalt
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

// =====================================
// TÅRN
// =====================================

function isLegalRookMove(fromRow, fromCol, toRow, toCol) {
  const horizontal = fromRow === toRow;
  const vertical = fromCol === toCol;

  if (!horizontal && !vertical) {
    return false;
  }

  if (horizontal) {
    const direction = toCol > fromCol ? 1 : -1;

    for (let col = fromCol + direction; col !== toCol; col += direction) {
      if (board[fromRow][col] !== "") {
        return false;
      }
    }
  }

  if (vertical) {
    const direction = toRow > fromRow ? 1 : -1;

    for (let row = fromRow + direction; row !== toRow; row += direction) {
      if (board[row][fromCol] !== "") {
        return false;
      }
    }
  }

  return true;
}

// =====================================
// LØBER
// =====================================

function isLegalBishopMove(fromRow, fromCol, toRow, toCol) {
  const rowDifference = Math.abs(toRow - fromRow);
  const colDifference = Math.abs(toCol - fromCol);

  if (rowDifference !== colDifference) {
    return false;
  }

  const rowDirection = toRow > fromRow ? 1 : -1;
  const colDirection = toCol > fromCol ? 1 : -1;

  let row = fromRow + rowDirection;
  let col = fromCol + colDirection;

  while (row !== toRow && col !== toCol) {
    if (board[row][col] !== "") {
      return false;
    }

    row += rowDirection;
    col += colDirection;
  }

  return true;
}

// =====================================
// SPRINGER
// =====================================

function isLegalKnightMove(fromRow, fromCol, toRow, toCol) {
  const rowDifference = Math.abs(toRow - fromRow);
  const colDifference = Math.abs(toCol - fromCol);

  return (
    (rowDifference === 2 && colDifference === 1) ||
    (rowDifference === 1 && colDifference === 2)
  );
}

// =====================================
// DRONNING
// =====================================

function isLegalQueenMove(fromRow, fromCol, toRow, toCol) {
  return (
    isLegalRookMove(fromRow, fromCol, toRow, toCol) ||
    isLegalBishopMove(fromRow, fromCol, toRow, toCol)
  );
}

// =====================================
// KONGE
// =====================================

function isLegalKingMove(fromRow, fromCol, toRow, toCol) {
  const rowDifference = Math.abs(toRow - fromRow);
  const colDifference = Math.abs(toCol - fromCol);

  return (
    rowDifference <= 1 &&
    colDifference <= 1 &&
    !(rowDifference === 0 && colDifference === 0)
  );
}

// =====================================
// FIND KONGEN
// =====================================

function findKing(color) {
  const king = color === "white" ? "♔" : "♚";

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col] === king) {
        return {
          row: row,
          col: col,
        };
      }
    }
  }

  return null;
}

// =====================================
// ER KONGEN I SKAK?
// =====================================

function isKingInCheck(color) {
  const kingPosition = findKing(color);

  if (kingPosition === null) {
    return false;
  }

  const enemyColor = color === "white" ? "black" : "white";

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];

      if (piece === "") {
        continue;
      }

      if (enemyColor === "white" && !isWhitePiece(piece)) {
        continue;
      }

      if (enemyColor === "black" && !isBlackPiece(piece)) {
        continue;
      }

      if (isAttackingSquare(row, col, kingPosition.row, kingPosition.col)) {
        return true;
      }
    }
  }

  return false;
}

// =====================================
// ANGREBER EN BRik ET FELT?
// =====================================

function isAttackingSquare(fromRow, fromCol, toRow, toCol) {
  const piece = board[fromRow][fromCol];

  // Bonde
  if (piece === "♙") {
    return toRow === fromRow - 1 && Math.abs(toCol - fromCol) === 1;
  }

  if (piece === "♟") {
    return toRow === fromRow + 1 && Math.abs(toCol - fromCol) === 1;
  }

  // Tårn
  if (piece === "♖" || piece === "♜") {
    return isLegalRookMove(fromRow, fromCol, toRow, toCol);
  }

  // Løber
  if (piece === "♗" || piece === "♝") {
    return isLegalBishopMove(fromRow, fromCol, toRow, toCol);
  }

  // Springer
  if (piece === "♘" || piece === "♞") {
    return isLegalKnightMove(fromRow, fromCol, toRow, toCol);
  }

  // Dronning
  if (piece === "♕" || piece === "♛") {
    return isLegalQueenMove(fromRow, fromCol, toRow, toCol);
  }

  // Konge
  if (piece === "♔" || piece === "♚") {
    return isLegalKingMove(fromRow, fromCol, toRow, toCol);
  }

  return false;
}

// =====================================
// LAV KOPI AF BRÆTTET
// =====================================

function copyBoard() {
  return board.map((row) => [...row]);
}

// =====================================
// GENDAN BRÆTTET
// =====================================

function hasLegalMove(color) {
  for (let fromRow = 0; fromRow < 8; fromRow++) {
    for (let fromCol = 0; fromCol < 8; fromCol++) {
      const piece = board[fromRow][fromCol];

      if (piece === "") {
        continue;
      }

      // Er det spillerens egen brik?
      if (color === "white" && !isWhitePiece(piece)) {
        continue;
      }

      if (color === "black" && !isBlackPiece(piece)) {
        continue;
      }

      // Prøv alle felter på brættet
      for (let toRow = 0; toRow < 8; toRow++) {
        for (let toCol = 0; toCol < 8; toCol++) {
          const targetPiece = board[toRow][toCol];

          // Man må ikke slå sin egen brik
          if (
            targetPiece !== "" &&
            isWhitePiece(piece) === isWhitePiece(targetPiece)
          ) {
            continue;
          }

          if (!isLegalMove(fromRow, fromCol, toRow, toCol)) {
            continue;
          }

          // Gem brættet
          const oldBoard = copyBoard();

          // Lav forsøgs-trækket
          board[toRow][toCol] = piece;
          board[fromRow][fromCol] = "";

          // Se om kongen stadig er i skak
          const stillInCheck = isKingInCheck(color);

          // Gendan brættet
          restoreBoard(oldBoard);

          // Hvis dette træk virker,
          // har spilleren mindst ét lovligt træk
          if (!stillInCheck) {
            return true;
          }
        }
      }
    }
  }

  return false;
}
// =====================================
// Checkmate
// =====================================
function isCheckmate(color) {
  return isKingInCheck(color) && !hasLegalMove(color);
}

// =====================================
// SKIFT SPILLER
// =====================================

function changeTurn() {
  if (currentPlayer === "white") {
    currentPlayer = "black";
    turnText.textContent = "Sorte's tur";
  } else {
    currentPlayer = "white";
    turnText.textContent = "Hvids tur";
  }
}

// =====================================
// FARVER
// =====================================

function isWhitePiece(piece) {
  return ["♔", "♕", "♖", "♗", "♘", "♙"].includes(piece);
}

function isBlackPiece(piece) {
  return ["♚", "♛", "♜", "♝", "♞", "♟"].includes(piece);
}

// =====================================
// MARKER VALGT BRik
// =====================================

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

// =====================================
// MARKER MULIGE TRÆK
// =====================================

function highlightPossibleMoves() {
  const squares = document.querySelectorAll(".square");

  squares.forEach((square) => {
    const row = Number(square.dataset.row);
    const col = Number(square.dataset.col);

    if (isLegalMove(selectedSquare.row, selectedSquare.col, row, col)) {
      const targetPiece = board[row][col];

      const selectedPiece = board[selectedSquare.row][selectedSquare.col];

      if (
        targetPiece === "" ||
        isWhitePiece(targetPiece) !== isWhitePiece(selectedPiece)
      ) {
        square.classList.add("possible-move");
      }
    }
  });
}

// =====================================
// START SPILLET
// =====================================

createBoard();
