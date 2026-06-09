import { useReducer, useCallback } from 'react';
import { INITIAL_BOARD } from './mockBoard';

function reducer(state, action) {
  switch (action.type) {
    case 'MOVE_CARD': {
      const { cardId, fromCol, toCol, insertIndex } = action;
      if (fromCol === toCol) return state;
      const card = state.cards[fromCol].find((c) => c.id === cardId);
      const newFrom = state.cards[fromCol].filter((c) => c.id !== cardId);
      const newTo = [...state.cards[toCol]];
      newTo.splice(insertIndex ?? newTo.length, 0, card);
      return { ...state, cards: { ...state.cards, [fromCol]: newFrom, [toCol]: newTo } };
    }
    case 'REORDER_COLUMNS': {
      const { fromIndex, toIndex } = action;
      const cols = [...state.columns];
      const [moved] = cols.splice(fromIndex, 1);
      cols.splice(toIndex, 0, moved);
      return { ...state, columns: cols };
    }
    case 'ADD_CARD': {
      const { colId, title } = action;
      const newCard = { id: `c${Date.now()}`, title, tag: 'Misc', priority: 'medium' };
      return { ...state, cards: { ...state.cards, [colId]: [...state.cards[colId], newCard] } };
    }
    default:
      return state;
  }
}

export function useKanban() {
  const [board, dispatch] = useReducer(reducer, INITIAL_BOARD);

  const moveCard = useCallback((cardId, fromCol, toCol, insertIndex) => {
    dispatch({ type: 'MOVE_CARD', cardId, fromCol, toCol, insertIndex });
  }, []);

  const reorderColumns = useCallback((fromIndex, toIndex) => {
    dispatch({ type: 'REORDER_COLUMNS', fromIndex, toIndex });
  }, []);

  const addCard = useCallback((colId, title) => {
    dispatch({ type: 'ADD_CARD', colId, title });
  }, []);

  return { board, moveCard, reorderColumns, addCard };
}
