import { useState, useCallback } from 'react';

const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function checkWinner(board) {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { player: board[a], line: [a, b, c] };
    }
  }
  return null;
}

export function useTicTacToe() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [stepIndex, setStepIndex] = useState(0);

  const board = history[stepIndex];
  const currentPlayer = stepIndex % 2 === 0 ? 'X' : 'O';
  const result = checkWinner(board);
  const winner = result?.player ?? null;
  const winLine = result?.line ?? [];
  const isDraw = !winner && board.every(Boolean);

  const makeMove = useCallback((idx) => {
    if (board[idx] || winner) return;
    const newBoard = [...board];
    newBoard[idx] = currentPlayer;
    const newHistory = history.slice(0, stepIndex + 1).concat([newBoard]);
    setHistory(newHistory);
    setStepIndex(newHistory.length - 1);
  }, [board, currentPlayer, history, stepIndex, winner]);

  const jumpTo = useCallback((step) => setStepIndex(step), []);

  const reset = useCallback(() => {
    setHistory([Array(9).fill(null)]);
    setStepIndex(0);
  }, []);

  return { board, currentPlayer, winner, winLine, isDraw, makeMove, history, stepIndex, jumpTo, reset };
}
