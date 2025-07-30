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
import { type Settings } from '@/types';

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

  const handleFontSizeChange = (value: number[]) => {
    const newSettings = { ...localSettings, fontSize: value[0] };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
    localStorage.setItem('echo-shell-settings', JSON.stringify(newSettings));
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
        <div className="grid gap-4 py-4">
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
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsMenu;
