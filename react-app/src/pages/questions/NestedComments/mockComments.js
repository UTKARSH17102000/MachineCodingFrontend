export const COMMENTS = [
  {
    id: '1', author: 'alice_dev', time: '2h ago', votes: 142, text: 'This is a great implementation! The recursive approach makes the code very clean and maintainable.',
    replies: [
      {
        id: '1-1', author: 'bob_js', time: '1h ago', votes: 38, text: 'Agreed! The key thing interviewers look for is how you handle the base case and the recursion depth limit.',
        replies: [
          { id: '1-1-1', author: 'carol_ts', time: '45m ago', votes: 12, text: 'Exactly. And making sure the collapse state is lifted up correctly so re-renders are minimal.', replies: [] },
        ],
      },
      { id: '1-2', author: 'dave_css', time: '55m ago', votes: 21, text: 'The indentation visual guide is a nice touch — makes threading much more readable.', replies: [] },
    ],
  },
  {
    id: '2', author: 'eve_react', time: '3h ago', votes: 89, text: 'How would you handle an infinitely deep thread? Reddit has a depth limit and shows "continue thread" links.',
    replies: [
      {
        id: '2-1', author: 'frank_node', time: '2h ago', votes: 55, text: 'We cap at depth 6 here. Beyond that, you render a "View more replies" button that opens a new root-level view.', replies: [],
      },
    ],
  },
  {
    id: '3', author: 'grace_ux', time: '4h ago', votes: 203, text: 'The vote interaction is really smooth. Optimistic UI updates are the way to go here — update immediately and revert on error.',
    replies: [],
  },
];
