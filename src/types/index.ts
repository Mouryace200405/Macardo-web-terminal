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

export type CursorStyle = 'block' | 'underline' | 'bar';

export interface Settings {
    fontSize: number;
    theme: TerminalTheme;
    cursorStyle: CursorStyle;
}
