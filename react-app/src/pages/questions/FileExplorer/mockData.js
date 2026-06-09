// File system hierarchy for the File Explorer question.
//
// Schema:
//   id       — stable unique identifier (used as React key + path-reference identity)
//   name     — display name
//   type     — 'folder' | 'file'
//   children — folders only; ABSENT on files (absence = leaf, [] = empty folder)
//   ext      — files only; explicit extension for icon coloring
//   size     — files only; human-readable size
//   modified — files only; human-readable last-modified date
//
// Edge cases deliberately included:
//   - Empty folders      : Downloads/, public/
//   - Deeply nested (5+) : Root > Music > Jazz > Miles Davis > *.mp3
//   - Duplicate names    : README.md appears in both react-app/ and vue-project/
//   - Mixed root content : folders AND a file (notes.txt) at the top level

export const FILE_SYSTEM = {
  id: 'root',
  name: 'Root',
  type: 'folder',
  children: [
    {
      id: 'documents',
      name: 'Documents',
      type: 'folder',
      children: [
        {
          id: 'work',
          name: 'Work',
          type: 'folder',
          children: [
            {
              id: 'projects',
              name: 'Projects',
              type: 'folder',
              children: [
                {
                  id: 'react-app',
                  name: 'react-app',
                  type: 'folder',
                  children: [
                    {
                      id: 'src-folder',
                      name: 'src',
                      type: 'folder',
                      children: [
                        { id: 'app-jsx',  name: 'App.jsx',  type: 'file', ext: 'jsx', size: '3.2 KB',  modified: 'Mar 10, 2025' },
                        { id: 'main-jsx', name: 'main.jsx', type: 'file', ext: 'jsx', size: '0.8 KB',  modified: 'Mar 8, 2025'  },
                      ],
                    },
                    {
                      id: 'public-folder',
                      name: 'public',
                      type: 'folder',
                      children: [], // intentionally EMPTY — edge case
                    },
                    { id: 'pkg-json',     name: 'package.json', type: 'file', ext: 'json', size: '1.1 KB', modified: 'Mar 8, 2025'  },
                    { id: 'readme-react', name: 'README.md',    type: 'file', ext: 'md',   size: '4.5 KB', modified: 'Mar 5, 2025'  },
                  ],
                },
                {
                  id: 'vue-project',
                  name: 'vue-project',
                  type: 'folder',
                  children: [
                    { id: 'index-html',  name: 'index.html', type: 'file', ext: 'html', size: '0.9 KB', modified: 'Feb 20, 2025' },
                    { id: 'readme-vue', name: 'README.md',   type: 'file', ext: 'md',   size: '2.1 KB', modified: 'Feb 18, 2025' }, // duplicate name — different id
                  ],
                },
              ],
            },
            {
              id: 'meetings',
              name: 'Meetings',
              type: 'folder',
              children: [
                { id: 'q1-notes', name: 'Q1-notes.docx', type: 'file', ext: 'docx', size: '48 KB',  modified: 'Apr 1, 2025' },
                { id: 'q2-notes', name: 'Q2-notes.docx', type: 'file', ext: 'docx', size: '52 KB',  modified: 'Jul 3, 2025' },
              ],
            },
            { id: 'annual-report', name: 'annual-report.pdf', type: 'file', ext: 'pdf', size: '2.4 MB', modified: 'Jan 31, 2025' },
          ],
        },
        {
          id: 'personal',
          name: 'Personal',
          type: 'folder',
          children: [
            { id: 'budget',        name: 'budget-2025.xlsx',  type: 'file', ext: 'xlsx', size: '88 KB',  modified: 'Jun 12, 2025' },
            { id: 'travel-plans',  name: 'travel-plans.pdf',  type: 'file', ext: 'pdf',  size: '1.2 MB', modified: 'May 7, 2025'  },
          ],
        },
        { id: 'taxes', name: 'taxes.pdf', type: 'file', ext: 'pdf', size: '340 KB', modified: 'Apr 15, 2025' },
      ],
    },
    {
      id: 'pictures',
      name: 'Pictures',
      type: 'folder',
      children: [
        {
          id: 'vacation',
          name: 'Vacation 2024',
          type: 'folder',
          children: [
            { id: 'beach',  name: 'beach.jpg',  type: 'file', ext: 'jpg', size: '3.8 MB', modified: 'Aug 14, 2024' },
            { id: 'sunset', name: 'sunset.jpg', type: 'file', ext: 'jpg', size: '4.1 MB', modified: 'Aug 14, 2024' },
            { id: 'hotel',  name: 'hotel.png',  type: 'file', ext: 'png', size: '2.9 MB', modified: 'Aug 15, 2024' },
          ],
        },
        { id: 'profile', name: 'profile.png', type: 'file', ext: 'png', size: '780 KB', modified: 'Jan 3, 2025'  },
        { id: 'banner',  name: 'banner.jpg',  type: 'file', ext: 'jpg', size: '1.1 MB', modified: 'Dec 10, 2024' },
      ],
    },
    {
      id: 'music',
      name: 'Music',
      type: 'folder',
      children: [
        {
          id: 'jazz',
          name: 'Jazz',
          type: 'folder',
          children: [
            {
              id: 'miles-davis',
              name: 'Miles Davis',
              type: 'folder',
              // 5 levels deep: Root > Music > Jazz > Miles Davis > *.mp3
              children: [
                { id: 'kind-of-blue',    name: 'kind-of-blue.mp3',    type: 'file', ext: 'mp3',  size: '92 MB',  modified: 'Nov 5, 2023' },
                { id: 'bitches-brew',    name: 'bitches-brew.flac',   type: 'file', ext: 'flac', size: '310 MB', modified: 'Nov 5, 2023' },
              ],
            },
          ],
        },
        { id: 'favorites', name: 'favorites.m3u', type: 'file', ext: 'm3u', size: '2 KB', modified: 'Jun 1, 2025' },
      ],
    },
    {
      id: 'videos',
      name: 'Videos',
      type: 'folder',
      children: [
        { id: 'tutorial',   name: 'tutorial.mp4',          type: 'file', ext: 'mp4', size: '156 MB', modified: 'May 20, 2025' },
        { id: 'recording',  name: 'screen-recording.mov',  type: 'file', ext: 'mov', size: '48 MB',  modified: 'Jun 5, 2025'  },
      ],
    },
    {
      id: 'downloads',
      name: 'Downloads',
      type: 'folder',
      children: [], // intentionally EMPTY — edge case
    },
    { id: 'notes-txt', name: 'notes.txt', type: 'file', ext: 'txt', size: '12 KB', modified: 'Jun 10, 2025' },
  ],
};
