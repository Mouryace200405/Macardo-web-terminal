export interface File {
  type: 'file';
  content: string;
}

export interface Directory {
  type: 'directory';
  children: { [key: string]: Directory | File };
}

export type FileSystem = Directory;

export type TerminalTheme = 'echo-shell' | 'powershell';

export interface Settings {
    fontSize: number;
    theme: TerminalTheme;
}
