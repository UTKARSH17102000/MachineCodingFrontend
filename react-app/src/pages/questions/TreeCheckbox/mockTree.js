export const TREE_DATA = [
  {
    id: 'frontend', label: 'Frontend',
    children: [
      { id: 'react',  label: 'React',  children: [
        { id: 'hooks',    label: 'Hooks',     children: [] },
        { id: 'context',  label: 'Context',   children: [] },
        { id: 'routing',  label: 'Routing',   children: [] },
      ]},
      { id: 'css',    label: 'CSS',    children: [
        { id: 'flexbox',  label: 'Flexbox',   children: [] },
        { id: 'grid',     label: 'CSS Grid',  children: [] },
        { id: 'modules',  label: 'CSS Modules', children: [] },
      ]},
    ],
  },
  {
    id: 'backend', label: 'Backend',
    children: [
      { id: 'node',   label: 'Node.js', children: [
        { id: 'express',  label: 'Express',  children: [] },
        { id: 'fastify',  label: 'Fastify',  children: [] },
      ]},
      { id: 'db',     label: 'Databases', children: [
        { id: 'postgres', label: 'PostgreSQL', children: [] },
        { id: 'redis',    label: 'Redis',      children: [] },
      ]},
    ],
  },
  {
    id: 'devops', label: 'DevOps',
    children: [
      { id: 'docker', label: 'Docker', children: [] },
      { id: 'ci',     label: 'CI/CD',  children: [] },
    ],
  },
];
