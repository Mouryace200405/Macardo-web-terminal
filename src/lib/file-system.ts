import type { FileSystem } from '@/types';

export const initialFileSystem: FileSystem = {
  type: 'directory',
  children: {
    home: {
      type: 'directory',
      children: {
        user: {
          type: 'directory',
          children: {
            projects: {
              type: 'directory',
              children: {
                'echo-shell': {
                  type: 'directory',
                  children: {
                    'README.md': {
                      type: 'file',
                      content: '# Echo Shell\nA terminal emulator built with Next.js and AI.',
                    },
                    'package.json': {
                        type: 'file',
                        content: '{ "name": "echo-shell", "version": "1.0.0" }'
                    }
                  },
                },
              },
            },
            documents: {
              type: 'directory',
              children: {
                'notes.txt': { type: 'file', content: 'Remember to buy milk.' },
                'plan.md': {type: 'file', content: '1. Build terminal\n2. Add AI\n3. ???\n4. Profit'}
              },
            },
            'welcome.txt': {
              type: 'file',
              content:
                'Welcome to Echo Shell! Type `help` to see available commands.',
            },
          },
        },
      },
    },
  },
};
