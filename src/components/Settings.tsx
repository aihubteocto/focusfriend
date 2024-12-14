import React, { useEffect, useState } from 'react';
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Settings {
  isEnabled: boolean;
  mode: 'normal' | 'deepWork' | 'creative';
}

const DEFAULT_SETTINGS: Settings = {
  isEnabled: true,
  mode: 'normal'
};

export const Settings = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load settings from storage
    chrome.storage.sync.get(['settings'], (result) => {
      if (result.settings) {
        setSettings(result.settings);
      }
    });
  }, []);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    try {
      // Save to storage
      await chrome.storage.sync.set({ settings: updatedSettings });
      
      // Notify background script
      await chrome.runtime.sendMessage({ 
        type: 'SETTINGS_UPDATED', 
        settings: updatedSettings 
      });

      toast({
        title: "Settings updated",
        description: "Your changes have been saved",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="icon"
        onClick={() => setIsOpen(true)}
        className="absolute top-4 right-4"
      >
        <SettingsIcon className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]">
          <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] z-[101]">
            <div className="bg-white rounded-lg shadow-lg p-6 w-[350px]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Settings</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  ✕
                </Button>
              </div>

              <div className="space-y-6">
                {/* Enable/Disable Switch */}
                <div className="flex items-center justify-between">
                  <label className="text-sm">Enable Notifications</label>
                  <Switch
                    checked={settings.isEnabled}
                    onCheckedChange={(checked) => updateSettings({ isEnabled: checked })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};