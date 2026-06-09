export const INITIAL_BOARD = {
  columns: [
    { id: 'todo',        title: 'To Do',      color: '#6b7280' },
    { id: 'in-progress', title: 'In Progress', color: '#6c63ff' },
    { id: 'review',      title: 'Review',      color: '#f59e0b' },
    { id: 'done',        title: 'Done',        color: '#10b981' },
  ],
  cards: {
    todo: [
      { id: 'c1', title: 'Design system tokens', tag: 'Design',   priority: 'high'   },
      { id: 'c2', title: 'Write API specs',       tag: 'Backend',  priority: 'medium' },
      { id: 'c3', title: 'Set up CI pipeline',    tag: 'DevOps',   priority: 'low'    },
    ],
    'in-progress': [
      { id: 'c4', title: 'Build auth flow',        tag: 'Frontend', priority: 'high'   },
      { id: 'c5', title: 'Database migrations',    tag: 'Backend',  priority: 'high'   },
    ],
    review: [
      { id: 'c6', title: 'Accessibility audit',    tag: 'QA',       priority: 'medium' },
    ],
    done: [
      { id: 'c7', title: 'Project kickoff',        tag: 'Misc',     priority: 'low'    },
      { id: 'c8', title: 'Requirements gathering', tag: 'Misc',     priority: 'medium' },
    ],
  },
};
