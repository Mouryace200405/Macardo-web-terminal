import type { Directory, File, FileSystem } from '@/types';

// --- Path Helpers ---
const resolvePath = (cwd: string, path: string, fs: FileSystem): { resolvedPath: string; error?: string } => {
  let newPathSegments;
  if (path.startsWith('/')) {
    newPathSegments = path.split('/').filter(p => p);
  } else {
    newPathSegments = [...cwd.split('/').filter(p => p), ...path.split('/').filter(p => p)];
  }

  const resolved: string[] = [];
  for (const segment of newPathSegments) {
    if (segment === '..') {
      if (resolved.length > 0) {
        resolved.pop();
      }
    } else if (segment !== '.') {
      resolved.push(segment);
    }
  }

  const finalPath = '/' + resolved.join('/');
  const node = getNodeFromPath(finalPath, fs);
  
  if (!node) {
    return { resolvedPath: finalPath, error: `path not found: ${path}` };
  }

  if (node.type === 'file' && path.slice(-1) === '/') {
    return { resolvedPath: finalPath, error: `not a directory: ${path}` };
  }
  
  return { resolvedPath: finalPath };
};

const getNodeFromPath = (path: string, fs: FileSystem): Directory | File | null => {
  const segments = path.split('/').filter(p => p);
  let currentNode: Directory = fs;
  for (const segment of segments) {
    if (currentNode.type === 'directory' && currentNode.children[segment]) {
      currentNode = currentNode.children[segment] as Directory;
    } else {
      return null;
    }
  }
  return currentNode;
};


// --- Command Implementations ---
const pwd = (cwd: string): string => cwd;

const echo = (args: string[]): string => args.join(' ');

const ls = (cwd: string, fs: FileSystem): string => {
  const node = getNodeFromPath(cwd, fs);
  if (node && node.type === 'directory') {
    return Object.keys(node.children)
      .map(name => {
        const child = node.children[name];
        return child.type === 'directory' ? `\u001b[34m${name}/\u001b[0m` : name;
      })
      .join('\n');
  }
  return `ls: cannot access '${cwd}': No such file or directory`;
};

const cd = (args: string[], cwd: string, fs: FileSystem): { newCwd: string; error?: string } => {
  const targetPath = args[0] || '/home/user';
  const { resolvedPath, error: pathError } = resolvePath(cwd, targetPath, fs);
  if (pathError) {
      return { newCwd: cwd, error: `cd: ${pathError}` };
  }
  
  const node = getNodeFromPath(resolvedPath, fs);
  if (!node || node.type !== 'directory') {
    return { newCwd: cwd, error: `cd: not a directory: ${targetPath}` };
  }
  
  return { newCwd: resolvedPath };
};

const cat = (args: string[], cwd: string, fs: FileSystem): { output: string; error?: string } => {
    if (args.length === 0) {
        return { output: '', error: 'cat: missing operand' };
    }
    const targetPath = args[0];
    const {resolvedPath, error: pathError} = resolvePath(cwd, targetPath, fs);
    if(pathError) {
        return { output: '', error: `cat: ${targetPath}: No such file or directory` };
    }

    const node = getNodeFromPath(resolvedPath, fs);
    if (!node) {
        return { output: '', error: `cat: ${targetPath}: No such file or directory` };
    }
    if (node.type === 'directory') {
        return { output: '', error: `cat: ${targetPath}: Is a directory` };
    }
    return { output: node.content };
};

const help = (): string => {
    return [
        '\u001b[96mEcho Shell - Available Commands:\u001b[0m',
        '  \u001b[93mpwd\u001b[0m             - Print name of current/working directory',
        '  \u001b[93mls\u001b[0m              - List directory contents',
        '  \u001b[93mcd [path]\u001b[0m     - Change the working directory',
        '  \u001b[93mecho [text]\u001b[0m   - Display a line of text',
        '  \u001b[93mcat [file]\u001b[0m    - Concatenate and display files',
        '  \u001b[93mclear\u001b[0m           - Clear the terminal screen',
        '  \u001b[93mhelp\u001b[0m            - Display this help message'
    ].join('\n');
}

// --- Main Processor ---
export const processCommand = (
  line: string,
  cwd: string,
  fs: FileSystem
): { output: string; newCwd: string; newFs: FileSystem; error?: string } => {
  const parts = line.trim().split(' ').filter(p => p);
  const command = parts[0];
  const args = parts.slice(1);

  let output = '';
  let newCwd = cwd;
  let error: string | undefined;

  switch (command) {
    case 'pwd':
      output = pwd(cwd);
      break;
    case 'echo':
      output = echo(args);
      break;
    case 'ls':
      output = ls(cwd, fs);
      break;
    case 'cd':
      const cdResult = cd(args, cwd, fs);
      newCwd = cdResult.newCwd;
      error = cdResult.error;
      break;
    case 'cat':
      const catResult = cat(args, cwd, fs);
      output = catResult.output;
      error = catResult.error;
      break;
    case 'help':
        output = help();
        break;
    case undefined: // Empty input
      break;
    default:
      error = `command not found: ${command}`;
      output = `\u001b[31m${error}\u001b[0m`;
  }
  return { output: error && output === '' ? output : output, newCwd, newFs: fs, error };
};
