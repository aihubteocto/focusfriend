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
];

export class SiteBlocker {
  private creativeModeTimes: { [key: string]: number } = {};

  constructor(private settings: Settings) {}

  public isDistractingSite(url: string): boolean {
    const hostname = new URL(url).hostname.toLowerCase();
    return DISTRACTING_SITES.some(site => hostname.includes(site));
  }

  public async handleSiteAccess(tab: chrome.tabs.Tab) {
    if (!tab.url || !this.settings.isEnabled) return;

    if (this.isDistractingSite(tab.url)) {
      switch (this.settings.mode) {
        case 'deepWork':
          await this.redirectToBlockPage(tab);
          break;
        case 'creative':
          await this.handleCreativeMode(tab);
          break;
      }
    }
  }

  public async blockAllDistractingSites() {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.url && this.isDistractingSite(tab.url)) {
        await this.redirectToBlockPage(tab);
      }
    }
  }

  public resetCreativeModeTimes() {
    this.creativeModeTimes = {};
  }

  private async handleCreativeMode(tab: chrome.tabs.Tab) {
    if (!tab.url) return;
    
    const hostname = new URL(tab.url).hostname;
    const now = Date.now();
    
    if (!this.creativeModeTimes[hostname]) {
      this.creativeModeTimes[hostname] = now;
    }

    const timeSpent = (now - this.creativeModeTimes[hostname]) / 1000 / 60;

    if (timeSpent > 15) {
      await this.redirectToBlockPage(tab);
      setTimeout(() => {
        this.creativeModeTimes[hostname] = now;
      }, 10 * 60 * 1000);
    }
  }

  private async redirectToBlockPage(tab: chrome.tabs.Tab) {
    if (!tab.id) return;
    
    const blockPageUrl = chrome.runtime.getURL('blocked.html');
    await chrome.tabs.update(tab.id, { url: blockPageUrl });
  }
}