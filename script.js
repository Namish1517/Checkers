const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');

let board = [];
let currentPlayer = 'r';
let selected = null;
let legalMoves = [];
let continuingCapture = false; 

function initBoard() {
  board = Array.from({ length: 8 }, () => Array(8).fill(null));
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) board[r][c] = 'b';
    }
  }
  for (let r = 5; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) board[r][c] = 'r';
    }
  }
}

function renderBoard() {
  boardEl.innerHTML = '';
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sq = document.createElement('div');
      sq.classList.add('square', ((r + c) % 2 === 1 ? 'dark' : 'light'));
      sq.dataset.row = r;
      sq.dataset.col = c;

      if (legalMoves.some(m => m.toRow === r && m.toCol === c)) {
        sq.classList.add('highlight');
      }

      const p = board[r][c];
      if (p) {
        const pieceEl = document.createElement('div');
        pieceEl.classList.add('piece', p.toLowerCase() === 'r' ? 'red' : 'black');
        if (p === 'R' || p === 'B') pieceEl.classList.add('king');
        if (selected && selected.row == r && selected.col == c) {
          pieceEl.classList.add('selected');
        }
        sq.appendChild(pieceEl);
      }

      sq.addEventListener('click', onSquareClick);
      boardEl.appendChild(sq);
    }
  }
  statusEl.textContent = currentPlayer === 'r' ? "White's turn" : "Black's turn";
}

function onSquareClick(e) {
  const r = +e.currentTarget.dataset.row;
  const c = +e.currentTarget.dataset.col;
  const p = board[r][c];

  if (continuingCapture) {
  
    const move = legalMoves.find(m => m.toRow === r && m.toCol === c);
    if (move) {
      makeMove(move);
    }
    return;
  }

  if (p && p.toLowerCase() === currentPlayer) {
    selected = { row: r, col: c };
    legalMoves = computeLegalMoves(r, c, p);
    renderBoard();
  } else if (selected) {
    const move = legalMoves.find(m => m.toRow === r && m.toCol === c);
    if (move) makeMove(move);
  }
}

function computeLegalMoves(r, c, piece) {
  const dirs = [];
  const isKing = piece === 'R' || piece === 'B';
  if (piece.toLowerCase() === 'r' || isKing) dirs.push([-1, -1], [-1, 1]);
  if (piece.toLowerCase() === 'b' || isKing) dirs.push([1, -1], [1, 1]);

  const moves = [];
  for (let [dr, dc] of dirs) {
    const nr = r + dr, nc = c + dc;
    if (inBounds(nr, nc) && board[nr][nc] === null) {
      moves.push({ toRow: nr, toCol: nc, captures: [] });
    }
    const jr = r + 2*dr, jc = c + 2*dc;
    if (inBounds(jr, jc) && board[nr]?.[nc] &&
        board[nr][nc].toLowerCase() !== piece.toLowerCase() &&
        board[jr][jc] === null) {
      moves.push({ toRow: jr, toCol: jc, captures: [{ row: nr, col: nc }] });
    }
  }
  return moves;
}

function makeMove(move) {
  const { row: sr, col: sc } = selected;
  const piece = board[sr][sc];
  board[move.toRow][move.toCol] = piece;
  board[sr][sc] = null;

  if (move.captures.length) {
    for (let cap of move.captures) board[cap.row][cap.col] = null;
  }


  if (piece === 'r' && move.toRow === 0) board[move.toRow][move.toCol] = 'R';
  if (piece === 'b' && move.toRow === 7) board[move.toRow][move.toCol] = 'B';


  if (move.captures.length) {
    const newR = move.toRow, newC = move.toCol;
    const newPiece = board[newR][newC];

    const further = computeLegalMoves(newR, newC, newPiece)
                    .filter(m => m.captures.length);
    if (further.length) {

      selected = { row: newR, col: newC };
      legalMoves = further;
      continuingCapture = true;
      renderBoard();
      return;
    }
  }


  continuingCapture = false;
  selected = null;
  legalMoves = [];
  currentPlayer = currentPlayer === 'r' ? 'b' : 'r';

  let redExists = false, blackExists = false;
  for (let row of board) {
  for (let cell of row) {
    if (cell === 'r' || cell === 'R') redExists = true;
    if (cell === 'b' || cell === 'B') blackExists = true;
  }
  }
  if (!redExists || !blackExists) {
  statusEl.textContent = redExists ? "White Wins!" : "Black Wins!";
  boardEl.style.pointerEvents = 'none'; // disable further clicks
  return;s
  }

  renderBoard();
}

function inBounds(r, c) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

initBoard();
renderBoard();
