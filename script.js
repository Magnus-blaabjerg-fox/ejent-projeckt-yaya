const chessboard = document.getElementById("chessboard");
const turnText = document.getElementById("turn");

let selectedSquare = null;
let currentPlayer = "white";

let whiteKingMoved = false;
let blackKingMoved = false;

let whiteRookLeftMoved = false;
let whiteRookRightMoved = false;

let blackRookLeftMoved = false;
let blackRookRightMoved = false;

// En passant
let enPassantTarget = null;
let enPassantPawn = null;

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

    // Gem den gamle en passant-status
    const oldEnPassantTarget = enPassantTarget;
    const oldEnPassantPawn = enPassantPawn;

    // Er dette et en passant-træk?
    const isEnPassantMove =
      (selectedPiece === "♙" || selectedPiece === "♟") &&
      enPassantTarget !== null &&
      row === enPassantTarget.row &&
      col === enPassantTarget.col &&
      board[row][col] === "" &&
      Math.abs(col - fromCol) === 1;

    // Flyt brikken
    board[row][col] = selectedPiece;
    board[fromRow][fromCol] = "";

    // Fjern den bonde, der bliver slået en passant
    if (isEnPassantMove && enPassantPawn !== null) {
      board[enPassantPawn.row][enPassantPawn.col] = "";
    }

    // En passant gælder kun ét træk.
    // Gem en ny mulighed, hvis denne bonde gik to felter.
    if (
      (selectedPiece === "♙" || selectedPiece === "♟") &&
      Math.abs(row - fromRow) === 2
    ) {
      enPassantTarget = {
        row: (fromRow + row) / 2,
        col: col,
      };

      enPassantPawn = {
        row: row,
        col: col,
      };
    } else {
      enPassantTarget = null;
      enPassantPawn = null;
    }

    // =====================================
    // FLYT TÅRNET VED ROKADE
    // =====================================

    if (selectedPiece === "♔" && fromRow === 7 && fromCol === 4) {
      // Kort rokade
      if (col === 6) {
        board[7][5] = board[7][7];
        board[7][7] = "";
      }

      // Lang rokade
      if (col === 2) {
        board[7][3] = board[7][0];
        board[7][0] = "";
      }
    }

    if (selectedPiece === "♚" && fromRow === 0 && fromCol === 4) {
      // Kort rokade
      if (col === 6) {
        board[0][5] = board[0][7];
        board[0][7] = "";
      }

      // Lang rokade
      if (col === 2) {
        board[0][3] = board[0][0];
        board[0][0] = "";
      }
    }

    // =====================================
    // BONDEFORFREMMELSE
    // =====================================

    if (selectedPiece === "♙" && row === 0) {
      const choice = prompt(
        "Vælg brik: D = Dronning, T = Tårn, L = Løber, S = Springer",
      );

      if (choice === "T" || choice === "t") {
        board[row][col] = "♖";
      } else if (choice === "L" || choice === "l") {
        board[row][col] = "♗";
      } else if (choice === "S" || choice === "s") {
        board[row][col] = "♘";
      } else {
        board[row][col] = "♕";
      }
    }

    if (selectedPiece === "♟" && row === 7) {
      const choice = prompt(
        "Vælg brik: D = Dronning, T = Tårn, L = Løber, S = Springer",
      );

      if (choice === "T" || choice === "t") {
        board[row][col] = "♜";
      } else if (choice === "L" || choice === "l") {
        board[row][col] = "♝";
      } else if (choice === "S" || choice === "s") {
        board[row][col] = "♞";
      } else {
        board[row][col] = "♛";
      }
    }

    // Find ud af hvilken farve kongen har
    const playerColor = currentPlayer;

    // Må spilleren lave dette træk?
    if (isKingInCheck(playerColor)) {
      // Fortryd trækket
      restoreBoard(oldBoard);

      // Gendan også en passant
      enPassantTarget = oldEnPassantTarget;
      enPassantPawn = oldEnPassantPawn;

      alert("Du må ikke sætte din egen konge i skak!");
    } else {
      changeTurn();

      // Tjek om modstanderen er i skak
      const opponent = currentPlayer;

      if (isCheckmate(opponent)) {
        turnText.textContent = "SKAKMAT!";

        alert(
          "SKAKMAT! " + (opponent === "white" ? "Sort" : "Hvid") + " vinder!",
        );
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
    return (
      isLegalKingMove(fromRow, fromCol, toRow, toCol) ||
      isLegalCastle(fromRow, fromCol, toRow, toCol)
    );
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

  // =====================================
  // EN PASSANT
  // =====================================

  if (
    Math.abs(toCol - fromCol) === 1 &&
    toRow === fromRow + direction &&
    targetPiece === "" &&
    enPassantTarget !== null &&
    enPassantTarget.row === toRow &&
    enPassantTarget.col === toCol &&
    enPassantPawn !== null &&
    enPassantPawn.row === fromRow &&
    enPassantPawn.col === toCol
  ) {
    const capturedPawn = board[enPassantPawn.row][enPassantPawn.col];

    // Der skal stå en modstanders bonde ved siden af
    return capturedPawn === (piece === "♙" ? "♟" : "♙");
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
// ROKADE
// =====================================

function isLegalCastle(fromRow, fromCol, toRow, toCol) {
  // HVID
  if (fromRow === 7 && fromCol === 4 && toRow === 7) {
    // Kongen må ikke stå i skak
    if (isKingInCheck("white")) {
      return false;
    }

    // KORT ROKADE
    if (
      toCol === 6 &&
      !whiteKingMoved &&
      !whiteRookRightMoved &&
      board[7][5] === "" &&
      board[7][6] === ""
    ) {
      // Feltet f1 må ikke være i skak
      board[7][5] = "♔";
      board[7][4] = "";

      const throughCheck = isKingInCheck("white");

      board[7][4] = "♔";
      board[7][5] = "";

      if (throughCheck) {
        return false;
      }

      // Feltet g1 må heller ikke være i skak
      board[7][6] = "♔";
      board[7][4] = "";

      const endInCheck = isKingInCheck("white");

      board[7][4] = "♔";
      board[7][6] = "";

      return !endInCheck;
    }

    // LANG ROKADE
    if (
      toCol === 2 &&
      !whiteKingMoved &&
      !whiteRookLeftMoved &&
      board[7][1] === "" &&
      board[7][2] === "" &&
      board[7][3] === ""
    ) {
      // Feltet d1 må ikke være i skak
      board[7][3] = "♔";
      board[7][4] = "";

      const throughCheck = isKingInCheck("white");

      board[7][4] = "♔";
      board[7][3] = "";

      if (throughCheck) {
        return false;
      }

      // Feltet c1 må ikke være i skak
      board[7][2] = "♔";
      board[7][4] = "";

      const endInCheck = isKingInCheck("white");

      board[7][4] = "♔";
      board[7][2] = "";

      return !endInCheck;
    }
  }

  // SORT
  if (fromRow === 0 && fromCol === 4 && toRow === 0) {
    // Kongen må ikke stå i skak
    if (isKingInCheck("black")) {
      return false;
    }

    // KORT ROKADE
    if (
      toCol === 6 &&
      !blackKingMoved &&
      !blackRookRightMoved &&
      board[0][5] === "" &&
      board[0][6] === ""
    ) {
      board[0][5] = "♚";
      board[0][4] = "";

      const throughCheck = isKingInCheck("black");

      board[0][4] = "♚";
      board[0][5] = "";

      if (throughCheck) {
        return false;
      }

      board[0][6] = "♚";
      board[0][4] = "";

      const endInCheck = isKingInCheck("black");

      board[0][4] = "♚";
      board[0][6] = "";

      return !endInCheck;
    }

    // LANG ROKADE
    if (
      toCol === 2 &&
      !blackKingMoved &&
      !blackRookLeftMoved &&
      board[0][1] === "" &&
      board[0][2] === "" &&
      board[0][3] === ""
    ) {
      board[0][3] = "♚";
      board[0][4] = "";

      const throughCheck = isKingInCheck("black");

      board[0][4] = "♚";
      board[0][3] = "";

      if (throughCheck) {
        return false;
      }

      board[0][2] = "♚";
      board[0][4] = "";

      const endInCheck = isKingInCheck("black");

      board[0][4] = "♚";
      board[0][2] = "";

      return !endInCheck;
    }
  }

  return false;
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
// ANGREBER EN BRIK ET FELT?
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

function restoreBoard(oldBoard) {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      board[row][col] = oldBoard[row][col];
    }
  }
}

// =====================================
// FIND LOVLIGE TRÆK
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
          const isEnPassantMove =
            (piece === "♙" || piece === "♟") &&
            enPassantTarget !== null &&
            toRow === enPassantTarget.row &&
            toCol === enPassantTarget.col &&
            board[toRow][toCol] === "" &&
            Math.abs(toCol - fromCol) === 1;

          board[toRow][toCol] = piece;
          board[fromRow][fromCol] = "";

          // Fjern bonde ved en passant i forsøgs-trækket
          if (isEnPassantMove && enPassantPawn !== null) {
            board[enPassantPawn.row][enPassantPawn.col] = "";
          }

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
// CHECKMATE
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
// MARKER VALGT BRIK
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
