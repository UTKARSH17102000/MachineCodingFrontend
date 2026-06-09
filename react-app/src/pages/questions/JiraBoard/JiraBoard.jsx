import { useRef, useState, useCallback } from 'react';
import { useKanban } from './useKanban';
import styles from './JiraBoard.module.css';

const PRIORITY_COLOR = { high: '#ef4444', medium: '#f59e0b', low: '#6b7280' };

function KanbanCard({ card, colId, onDragStart, onMoveKeyboard, columns }) {
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  return (
    <article
      className={styles.card}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(card.id, colId);
      }}
      aria-label={`${card.title}, ${card.tag}, ${card.priority} priority`}
    >
      <div className={styles.cardHeader}>
        <span className={styles.cardTag}>{card.tag}</span>
        <span
          className={styles.cardPriority}
          style={{ background: PRIORITY_COLOR[card.priority] }}
          aria-label={`${card.priority} priority`}
        />
      </div>
      <p className={styles.cardTitle}>{card.title}</p>
      <div className={styles.cardFooter}>
        <button
          className={styles.moveBtn}
          aria-label="Move card to another column"
          aria-expanded={showMoveMenu}
          onClick={() => setShowMoveMenu((v) => !v)}
        >
          ↔ Move
        </button>
        {showMoveMenu && (
          <ul className={styles.moveMenu} role="menu" aria-label="Move to column">
            {columns
              .filter((c) => c.id !== colId)
              .map((c) => (
                <li key={c.id} role="none">
                  <button
                    role="menuitem"
                    className={styles.moveMenuItem}
                    onClick={() => { onMoveKeyboard(card.id, colId, c.id); setShowMoveMenu(false); }}
                  >
                    {c.title}
                  </button>
                </li>
              ))}
          </ul>
        )}
      </div>
    </article>
  );
}

function KanbanColumn({ column, cards, dragState, onDragStart, onDrop, onDragOver, onMoveKeyboard, columns, addCard }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const isDragOver = dragState.overCol === column.id;

  function handleAdd(e) {
    e.preventDefault();
    if (newTitle.trim()) { addCard(column.id, newTitle.trim()); setNewTitle(''); setIsAdding(false); }
  }

  return (
    <section
      className={`${styles.column} ${isDragOver ? styles.columnOver : ''}`}
      aria-label={`${column.title} column — ${cards.length} card${cards.length !== 1 ? 's' : ''}`}
      onDragOver={(e) => { e.preventDefault(); onDragOver(column.id); }}
      onDrop={(e) => { e.preventDefault(); onDrop(column.id, cards.length); }}
    >
      <header className={styles.colHeader}>
        <span className={styles.colDot} style={{ background: column.color }} aria-hidden="true" />
        <h2 className={styles.colTitle}>{column.title}</h2>
        <span className={styles.colCount} aria-hidden="true">{cards.length}</span>
      </header>

      <div className={styles.cardList}>
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={styles.cardSlot}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); onDragOver(column.id, index); }}
            onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onDrop(column.id, index); }}
          >
            <KanbanCard
              card={card}
              colId={column.id}
              onDragStart={onDragStart}
              onMoveKeyboard={onMoveKeyboard}
              columns={columns}
            />
          </div>
        ))}
      </div>

      {isAdding ? (
        <form className={styles.addForm} onSubmit={handleAdd}>
          <textarea
            className={styles.addInput}
            placeholder="Card title…"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            rows={2}
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Escape') { setIsAdding(false); setNewTitle(''); } }}
          />
          <div className={styles.addActions}>
            <button type="submit" className={styles.addConfirm}>Add</button>
            <button type="button" className={styles.addCancel} onClick={() => { setIsAdding(false); setNewTitle(''); }}>✕</button>
          </div>
        </form>
      ) : (
        <button className={styles.addCardBtn} onClick={() => setIsAdding(true)}>
          + Add card
        </button>
      )}
    </section>
  );
}

export default function JiraBoard() {
  const { board, moveCard, addCard } = useKanban();
  const [dragState, setDragState] = useState({ cardId: null, fromCol: null, overCol: null });
  const dragRef = useRef({ cardId: null, fromCol: null });

  const handleDragStart = useCallback((cardId, colId) => {
    dragRef.current = { cardId, fromCol: colId };
    setDragState((s) => ({ ...s, cardId, fromCol: colId }));
  }, []);

  const handleDragOver = useCallback((colId) => {
    setDragState((s) => (s.overCol === colId ? s : { ...s, overCol: colId }));
  }, []);

  const handleDrop = useCallback((toCol, insertIndex) => {
    const { cardId, fromCol } = dragRef.current;
    if (cardId && fromCol !== toCol) {
      moveCard(cardId, fromCol, toCol, insertIndex);
    }
    dragRef.current = { cardId: null, fromCol: null };
    setDragState({ cardId: null, fromCol: null, overCol: null });
  }, [moveCard]);

  const handleMoveKeyboard = useCallback((cardId, fromCol, toCol) => {
    moveCard(cardId, fromCol, toCol);
  }, [moveCard]);

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.heading}>Jira Board (Drag & Drop)</h1>
        <p className={styles.subheading}>
          Kanban board — drag cards between columns or use the ↔ Move button for keyboard access.
        </p>
      </header>

      <div
        className={styles.board}
        role="region"
        aria-label="Kanban board"
        onDragEnd={() => {
          dragRef.current = { cardId: null, fromCol: null };
          setDragState({ cardId: null, fromCol: null, overCol: null });
        }}
      >
        {board.columns.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            cards={board.cards[col.id]}
            dragState={dragState}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onMoveKeyboard={handleMoveKeyboard}
            columns={board.columns}
            addCard={addCard}
          />
        ))}
      </div>
    </section>
  );
}
