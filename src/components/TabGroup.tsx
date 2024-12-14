import React from "react";
import { Button } from "@/components/ui/button";
import { LayersIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Constants for site categorization
const WORK_SITES = [
  'github.com',
  'gitlab.com',
  'notion.so',
  'slack.com',
  'trello.com',
  'asana.com'
];

const SOCIAL_SITES = [
  'youtube.com',
  'facebook.com',
  'twitter.com',
  'instagram.com',
  'reddit.com',
  'tiktok.com',
  'netflix.com',
  'discord.com'
];

const RESEARCH_SITES = [
  'google.com',
  'stackoverflow.com',
  'developer.mozilla.org',
  'medium.com',
  'wikipedia.org'
];

export const TabGroup = () => {
  const { toast } = useToast();

  const categorizeTab = (url: string) => {
    const hostname = new URL(url).hostname.toLowerCase();
    
    if (WORK_SITES.some(site => hostname.includes(site))) return "Work";
    if (SOCIAL_SITES.some(site => hostname.includes(site))) return "Social";
    if (RESEARCH_SITES.some(site => hostname.includes(site))) return "Research";
    return "Other";
  };

  const getColorForCategory = (category: string) => {
    const colors: { [key: string]: chrome.tabGroups.ColorEnum } = {
      Work: "blue",
      Social: "red",
      Research: "green",
      Other: "grey"
    };
    return colors[category] || "grey";
  };

  const organizeTabs = async () => {
    try {
      const windows = await chrome.windows.getAll({ populate: true });
      
      for (const window of windows) {
        const categorizedTabs: { [key: string]: chrome.tabs.Tab[] } = {
          Work: [],
          Social: [],
          Research: [],
          Other: []
        };

        // Categorize tabs
        window.tabs?.forEach(tab => {
          if (tab.url) {
            const category = categorizeTab(tab.url);
            categorizedTabs[category].push(tab);
          }
        });

        // Create groups
        for (const [category, tabs] of Object.entries(categorizedTabs)) {
          if (tabs.length > 0) {
            const tabIds = tabs.map(tab => tab.id).filter((id): id is number => id !== undefined);
            const groupId = await chrome.tabs.group({ tabIds });
            await chrome.tabGroups.update(groupId, {
              title: category,
              collapsed: true,
              color: getColorForCategory(category)
            });
          }
        }
      }

      toast({
        title: "Tabs organized successfully",
        description: "Your tabs have been grouped by category",
      });
    } catch (error) {
      toast({
        title: "Error organizing tabs",
        description: "Please make sure you have the necessary permissions",
        variant: "destructive",
      });
      console.error('Error organizing tabs:', error);
    }
  };

  return (
    <Button
      onClick={organizeTabs}
      className="bg-primary hover:bg-primary-hover text-white w-full"
    >
      <LayersIcon className="w-5 h-5 mr-2" />
      Organize Tabs
    </Button>
  );
};