import { useTicTacToe } from './useTicTacToe';
import styles from './TicTacToe.module.css';

function Square({ value, onClick, isWinning, idx }) {
  const row = Math.floor(idx / 3) + 1;
  const col = (idx % 3) + 1;
  return (
    <button
      role="gridcell"
      aria-label={`Row ${row}, Column ${col} — ${value || 'empty'}`}
      className={`${styles.square} ${isWinning ? styles.winning : ''} ${value === 'X' ? styles.x : value === 'O' ? styles.o : ''}`}
      onClick={onClick}
    >
      {value}
    </button>
  );
}

export default function TicTacToe() {
  const { board, currentPlayer, winner, winLine, isDraw, makeMove, history, stepIndex, jumpTo, reset } = useTicTacToe();

  const status = winner
    ? `Player ${winner} wins!`
    : isDraw
    ? "It's a draw!"
    : `Player ${currentPlayer}'s turn`;

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.heading}>Tic Tac Toe</h1>
        <p className={styles.subheading}>2-player game with win detection, draw detection, and move history time travel.</p>
      </header>

      <div className={styles.layout}>
        <div className={styles.gameArea}>
          <p
            className={`${styles.status} ${winner ? styles.winMsg : isDraw ? styles.drawMsg : ''}`}
            role="status"
            aria-live="polite"
          >
            {status}
          </p>

          <div role="grid" aria-label="Tic Tac Toe board" className={styles.board}>
            {board.map((val, idx) => (
              <Square
                key={idx}
                idx={idx}
                value={val}
                isWinning={winLine.includes(idx)}
                onClick={() => makeMove(idx)}
              />
            ))}
          </div>

          <button className={styles.resetBtn} onClick={reset}>New Game</button>
        </div>

        <div className={styles.history}>
          <h2 className={styles.historyTitle}>Move History</h2>
          <ol className={styles.moveList}>
            {history.map((_, step) => (
              <li key={step}>
                <button
                  className={`${styles.moveBtn} ${step === stepIndex ? styles.moveBtnActive : ''}`}
                  onClick={() => jumpTo(step)}
                >
                  {step === 0 ? 'Game start' : `Move #${step}`}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
