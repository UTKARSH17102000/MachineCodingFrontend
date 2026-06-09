import { useState, useCallback } from 'react';
import { COMMENTS } from './mockComments';

function addReplyById(comments, parentId, newReply) {
  return comments.map((c) => {
    if (c.id === parentId) return { ...c, replies: [...c.replies, newReply] };
    return { ...c, replies: addReplyById(c.replies, parentId, newReply) };
  });
}

function updateVote(comments, id, delta) {
  return comments.map((c) => {
    if (c.id === id) return { ...c, votes: c.votes + delta };
    return { ...c, replies: updateVote(c.replies, id, delta) };
  });
}

export function useComments() {
  const [comments, setComments] = useState(COMMENTS);
  const [collapsed, setCollapsed] = useState(new Set());
  const [replyingTo, setReplyingTo] = useState(null);

  const toggleCollapse = useCallback((id) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const addReply = useCallback((parentId, text) => {
    const newReply = {
      id: `${parentId}-${Date.now()}`,
      author: 'you',
      time: 'just now',
      votes: 1,
      text,
      replies: [],
    };
    setComments((prev) => addReplyById(prev, parentId, newReply));
    setReplyingTo(null);
  }, []);

  const vote = useCallback((id, delta) => {
    setComments((prev) => updateVote(prev, id, delta));
  }, []);

  return {
    comments,
    isCollapsed: (id) => collapsed.has(id),
    toggleCollapse,
    replyingTo,
    setReplyingTo,
    addReply,
    vote,
  };
}
