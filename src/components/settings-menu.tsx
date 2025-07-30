'use client';

import React, { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Settings, type TerminalTheme } from '@/types';

interface SettingsMenuProps {
  children: React.ReactNode;
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ children, settings, onSettingsChange }) => {
  const [localSettings, setLocalSettings] = useState<Settings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const updateSettings = (newSettings: Settings) => {
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
    localStorage.setItem('echo-shell-settings', JSON.stringify(newSettings));
  }

  const handleFontSizeChange = (value: number[]) => {
    updateSettings({ ...localSettings, fontSize: value[0] });
  };
  
  const handleThemeChange = (value: TerminalTheme) => {
    updateSettings({ ...localSettings, theme: value });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Terminal Settings</SheetTitle>
          <SheetDescription>
            Customize the appearance of your Echo Shell.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="font-size" className="text-right col-span-2">
              Font Size
            </Label>
            <span className="col-span-2">{localSettings.fontSize}px</span>
          </div>
          <Slider
            id="font-size"
            min={10}
            max={24}
            step={1}
            value={[localSettings.fontSize]}
            onValueChange={handleFontSizeChange}
            className="col-span-4"
          />
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="theme" className="text-right col-span-2">
              Theme
            </Label>
             <Select value={localSettings.theme} onValueChange={handleThemeChange}>
                <SelectTrigger className="col-span-2">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="echo-shell">Echo Shell</SelectItem>
                  <SelectItem value="powershell">Powershell</SelectItem>
                </SelectContent>
              </Select>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsMenu;
