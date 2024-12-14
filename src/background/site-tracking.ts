import { Settings } from './types';

export const DISTRACTING_SITES = [
    'youtube.com',
    'facebook.com',
    'twitter.com',
    'instagram.com',
    'reddit.com',
    'tiktok.com',
    'netflix.com',
    'discord.com'
  ]

export class SiteTracker {
  private siteTimers: { [key: string]: number } = {};
  private activeTabId: number | null = null;
  private activeTabTimer: NodeJS.Timeout | null = null;

  constructor(private settings: Settings) {
    this.initializeTracking();
  }

  private initializeTracking() {
    chrome.storage.local.get(['siteTimers'], (result) => {
      if (result.siteTimers) {
        this.siteTimers = result.siteTimers;
      }
    });

    this.setupTabListeners();
    this.setupAlarms();
  }

  private setupTabListeners() {
    chrome.tabs.onActivated.addListener(async (activeInfo) => {
      try {
        const tab = await chrome.tabs.get(activeInfo.tabId);
        this.handleTabChange(tab);
      } catch (error) {
        console.error('Error in tab activation:', error);
      }
    });

    chrome.tabs.onRemoved.addListener((tabId) => {
      if (tabId === this.activeTabId && this.activeTabTimer) {
        clearInterval(this.activeTabTimer);
        this.activeTabId = null;
      }
    });
  }

  private setupAlarms() {
    chrome.alarms.create('resetTimers', {
      periodInMinutes: 1440
    });

    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'resetTimers') {
        this.siteTimers = {};
        chrome.storage.local.set({ siteTimers: this.siteTimers });
      }
    });
  }

  private handleTabChange(tab: chrome.tabs.Tab) {
    if (this.activeTabTimer) {
      clearInterval(this.activeTabTimer);
    }

    if (tab.url && this.isDistractingSite(tab.url)) {
      const hostname = new URL(tab.url).hostname;
      this.activeTabId = tab.id || null;
      
      if (!this.siteTimers[hostname]) {
        this.siteTimers[hostname] = 0;
      }

      this.activeTabTimer = setInterval(() => {
        this.siteTimers[hostname]++;
        chrome.storage.local.set({ siteTimers: this.siteTimers });

        if (this.settings.isEnabled && 
            this.settings.mode === 'normal' && 
            this.siteTimers[hostname] % 10 === 0) {
          this.showNotification("Time Check ⏰", this.getMotivationalMessage(hostname));
        }
      }, 1000);
    }
  }

  private isDistractingSite(url: string): boolean {
    const hostname = new URL(url).hostname.toLowerCase();
    return DISTRACTING_SITES.some(site => hostname.includes(site));
  }

  private getMotivationalMessage(site: string): string {
    const messages = [
      `Taking a break from ${site} might help you stay focused!`,
      `You've been on ${site} for a while. Ready to get back to work?`,
      `Quick reminder: Your goals are waiting for you!`,
      `Time flies when we're distracted. Let's refocus!`,
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private showNotification(title: string, message: string) {
    if (this.settings.isEnabled) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon48.png',
        title,
        message,
      });
    }
  }
}