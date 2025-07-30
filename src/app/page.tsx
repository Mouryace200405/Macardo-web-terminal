'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Settings, Terminal } from 'lucide-react';
import AnsiToHtml from '@/components/ansi-to-html';
import SettingsMenu from '@/components/settings-menu';
import { type Settings as AppSettings } from '@/types';
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

export default function EchoShellPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AppSettings>({ fontSize: 14 });
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
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage', error);
    }
    const welcomeMessage = processCommand('cat welcome.txt', cwd, fs);
    setHistory(welcomeMessage.output.split('\n'));
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

  const handleCommandSubmit = useCallback(async (command: string) => {
    if (!command.trim()) {
      setHistory(prev => [...prev, `\u001b[35m${cwd}\u001b[0m \u001b[36m¶\u001b[0m `]);
      return;
    }

    setIsExecuting(true);
    setHistory(prev => [...prev, `\u001b[35m${cwd}\u001b[0m \u001b[36m¶\u001b[0m ${command}`]);
    
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
  }, [cwd, fs, toast]);

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

  const prompt = (
    <div className="flex-shrink-0 flex items-center">
      <span className="text-accent">{cwd}</span>
      <span className="text-cyan-400 mx-1">¶</span>
    </div>
  );

  return (
    <div
      className="bg-background text-foreground font-code w-screen h-screen overflow-hidden flex flex-col transition-all duration-300"
      style={{ fontSize: `${settings.fontSize}px` }}
      onClick={() => inputRef.current?.focus()}
    >
      <header className="flex items-center justify-between p-2 bg-card/50 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-accent" />
          <h1 className="text-lg font-bold text-foreground">Echo Shell</h1>
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
            <div className="relative flex-grow">
                 <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="bg-transparent border-none focus:ring-0 w-full p-0 ml-2"
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    disabled={isExecuting}
                />
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
