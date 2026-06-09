export const FILE_TREE = {
  id: 'root',
  name: 'project',
  type: 'folder',
  children: [
    {
      id: 'src',
      name: 'src',
      type: 'folder',
      children: [
        {
          id: 'components',
          name: 'components',
          type: 'folder',
          children: [
            { id: 'button', name: 'Button.jsx', type: 'file' },
            { id: 'input',  name: 'Input.jsx',  type: 'file' },
            { id: 'modal',  name: 'Modal.jsx',  type: 'file' },
          ],
        },
        {
          id: 'pages',
          name: 'pages',
          type: 'folder',
          children: [
            { id: 'home',    name: 'Home.jsx',    type: 'file' },
            { id: 'about',   name: 'About.jsx',   type: 'file' },
            { id: 'contact', name: 'Contact.jsx', type: 'file' },
          ],
        },
        { id: 'main',  name: 'main.jsx',  type: 'file' },
        { id: 'app',   name: 'App.jsx',   type: 'file' },
      ],
    },
    {
      id: 'public',
      name: 'public',
      type: 'folder',
      children: [
        { id: 'index-html', name: 'index.html', type: 'file' },
        { id: 'favicon',    name: 'favicon.ico', type: 'file' },
      ],
    },
    { id: 'pkg',       name: 'package.json',  type: 'file' },
    { id: 'readme',    name: 'README.md',     type: 'file' },
    { id: 'gitignore', name: '.gitignore',    type: 'file' },
  ],
};
