'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Settings } from 'lucide-react';
import AnsiToHtml from '@/components/ansi-to-html';
import SettingsMenu from '@/components/settings-menu';
import { type Settings as AppSettings, type TerminalTheme } from '@/types';
import { initialFileSystem } from '@/lib/file-system';
import { processCommand } from '@/lib/commands';
import { getCommandSuggestions } from './actions';
import { useToast } from '@/hooks/use-toast';

const useDebounce = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
};

const initialSettings: AppSettings = {
    fontSize: 14,
    theme: 'echo-shell',
    cursorStyle: 'block',
}

export default function EchoShellPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [history, setHistory] = useState<string[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [commandHistoryPointer, setCommandHistoryPointer] = useState(-1);
  const [input, setInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState(0);

  const [cwd, setCwd] = useState('/home/user');
  const [fs, setFs] = useState(() => JSON.parse(JSON.stringify(initialFileSystem)));

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('echo-shell-settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      } else {
        setSettings(initialSettings);
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage', error);
      setSettings(initialSettings);
    }
    // Welcome message removed
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  const fetchSuggestions = useDebounce(async (currentInput: string, history: string[]) => {
    if (currentInput.trim().length > 1) {
      try {
        const result = await getCommandSuggestions({
          userInput: currentInput,
          commandHistory: history.slice(-5),
        });
        setSuggestions(result || []);
        setActiveSuggestion(0);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  }, 300);

  useEffect(() => {
    fetchSuggestions(input, commandHistory);
  }, [input, commandHistory, fetchSuggestions]);

  const getPrompt = (theme: TerminalTheme, currentWorkingDirectory: string) => {
    switch (theme) {
      case 'powershell':
        return (
          <div className="flex-shrink-0 flex items-center">
            <span className="text-blue-300">PS </span>
            <span className="text-foreground">{currentWorkingDirectory.replace(/\//g, '\\')}</span>
            <span className="text-foreground">¶</span>
          </div>
        );
      case 'echo-shell':
      default:
        return (
          <div className="flex-shrink-0 flex items-center">
            <span className="text-accent">{currentWorkingDirectory}</span>
            <span className="text-cyan-400 mx-1">¶</span>
          </div>
        );
    }
  };

  const handleCommandSubmit = useCallback(async (command: string) => {
    const promptText = getPrompt(settings.theme, cwd).props.children.map((child: any) => child.props.children).join('');
    
    if (!command.trim()) {
      setHistory(prev => [...prev, `${promptText} `]);
      return;
    }

    setIsExecuting(true);
    setHistory(prev => [...prev, `${promptText} ${command}`]);
    
    // Simulate async execution
    await new Promise(res => setTimeout(res, 100 + Math.random() * 200));

    if (command === 'clear') {
      setHistory([]);
    } else {
      const result = processCommand(command, cwd, fs);
      if (result.error) {
        toast({
            variant: "destructive",
            title: "Command Error",
            description: result.error,
        });
      }
      setHistory(prev => [...prev, ...result.output.split('\n')]);
      setCwd(result.newCwd);
      setFs(result.newFs);
    }

    setCommandHistory(prev => [command, ...prev]);
    setCommandHistoryPointer(-1);
    setInput('');
    setSuggestions([]);
    setIsExecuting(false);
  }, [cwd, fs, toast, settings.theme]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommandSubmit(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newPointer = Math.min(commandHistoryPointer + 1, commandHistory.length - 1);
        setCommandHistoryPointer(newPointer);
        setInput(commandHistory[newPointer]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (commandHistoryPointer > -1) {
        const newPointer = Math.max(commandHistoryPointer - 1, -1);
        setCommandHistoryPointer(newPointer);
        setInput(newPointer === -1 ? '' : commandHistory[newPointer]);
      }
    } else if (e.key === 'Tab' && suggestions.length > 0) {
        e.preventDefault();
        setInput(suggestions[activeSuggestion]);
        setSuggestions([]);
    } else if (e.key === 'ArrowRight' && suggestions.length > 0 && input === '') {
        // Simple suggestion navigation for demo
        setActiveSuggestion((prev) => (prev + 1) % suggestions.length);
    }
  };

  const prompt = getPrompt(settings.theme, cwd);

  const getCursorClass = () => {
    switch(settings.cursorStyle) {
      case 'underline': return 'caret-primary border-b-2 border-primary';
      case 'bar': return 'caret-primary border-l-2 border-primary';
      case 'block':
      default:
        return 'caret-transparent';
    }
  }

  const cursorIsBlock = settings.cursorStyle === 'block';

  return (
    <div
      className="bg-background text-foreground font-code w-screen h-screen overflow-hidden flex flex-col transition-all duration-300"
      style={{ fontSize: `${settings.fontSize}px` }}
      onClick={() => inputRef.current?.focus()}
    >
      <header className="flex items-center justify-between p-2 bg-card/50 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">¶</span>
          <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Macardo</h1>
        </div>
        <SettingsMenu settings={settings} onSettingsChange={setSettings}>
          <button className="p-2 rounded-md hover:bg-secondary">
            <Settings className="w-5 h-5" />
          </button>
        </SettingsMenu>
      </header>

      <div ref={containerRef} className="flex-grow p-4 overflow-y-auto">
        {history.map((line, index) => (
          <div key={index} className="whitespace-pre-wrap leading-relaxed animate-fade-in">
            <AnsiToHtml text={line} />
          </div>
        ))}
        <div className="flex items-center mt-2">
            {prompt}
            <div className="relative flex-grow flex items-center">
                 <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={`bg-transparent border-none focus:ring-0 w-full p-0 ml-2 ${getCursorClass()}`}
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    disabled={isExecuting}
                />
                 {cursorIsBlock && !isExecuting && (
                  <span className="bg-primary animate-pulse w-[1ch] h-[1.2em] inline-block absolute left-2"
                   style={{
                      transform: `translateX(${input.length}ch)`
                   }}
                  />
                 )}
                {suggestions.length > 0 && !isExecuting && (
                    <div className="absolute bottom-full left-2 mb-1 bg-card border border-border rounded-md p-1 text-sm shadow-lg flex gap-2">
                        {suggestions.map((s, i) => (
                            <span 
                                key={s} 
                                className={`px-2 py-1 rounded-sm ${i === activeSuggestion ? 'bg-accent text-accent-foreground' : 'bg-muted'}`}
                            >
                                {s}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
