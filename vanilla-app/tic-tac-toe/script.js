'use strict';

const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function checkWinner(board) {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return { player: board[a], line: [a,b,c] };
  }
  return null;
}

const ROW_LABELS = ['Row 1', 'Row 1', 'Row 1', 'Row 2', 'Row 2', 'Row 2', 'Row 3', 'Row 3', 'Row 3'];
const COL_LABELS = ['Column 1', 'Column 2', 'Column 3', 'Column 1', 'Column 2', 'Column 3', 'Column 1', 'Column 2', 'Column 3'];

(function init() {
  const boardEl   = document.getElementById('board');
  const statusEl  = document.getElementById('status');
  const historyEl = document.getElementById('history');
  const resetBtn  = document.getElementById('resetBtn');

  let history    = [Array(9).fill(null)];
  let stepIndex  = 0;

  function currentBoard() { return history[stepIndex]; }
  function currentPlayer() { return stepIndex % 2 === 0 ? 'X' : 'O'; }

  function render() {
    const board  = currentBoard();
    const result = checkWinner(board);
    const isDraw = !result && board.every(Boolean);
    const player = currentPlayer();

    // Board
    boardEl.innerHTML = '';
    board.forEach((cell, i) => {
      const btn = document.createElement('button');
      btn.className = 'cell' + (cell === 'X' ? ' x' : cell === 'O' ? ' o' : '');
      btn.textContent = cell ?? '';
      btn.setAttribute('role', 'gridcell');
      btn.setAttribute('aria-label', `${ROW_LABELS[i]}, ${COL_LABELS[i]} — ${cell ?? 'empty'}`);
      btn.disabled = !!cell || !!result || isDraw;
      if (result?.line.includes(i)) btn.classList.add('win');
      btn.addEventListener('click', () => makeMove(i));
      boardEl.appendChild(btn);
    });

    // Status
    if (result)   statusEl.textContent = `Player ${result.player} wins! 🎉`;
    else if (isDraw) statusEl.textContent = "It's a draw!";
    else          statusEl.textContent = `Player ${player}'s turn`;

    // History
    historyEl.innerHTML = '';
    history.forEach((_, step) => {
      const li  = document.createElement('li');
      const btn = document.createElement('button');
      btn.textContent = step === 0 ? 'Go to start' : `Move #${step}`;
      btn.className   = step === stepIndex ? 'current' : '';
      btn.addEventListener('click', () => { stepIndex = step; render(); });
      li.appendChild(btn);
      historyEl.appendChild(li);
    });
  }

  function makeMove(idx) {
    const board = currentBoard().slice();
    if (board[idx] || checkWinner(board)) return;
    board[idx] = currentPlayer();
    history = [...history.slice(0, stepIndex + 1), board];
    stepIndex++;
    render();
  }

  resetBtn.addEventListener('click', () => {
    history = [Array(9).fill(null)];
    stepIndex = 0;
    render();
  });

  render();
})();
