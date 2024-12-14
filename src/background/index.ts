import { TimerManager } from './timer';
import { SiteBlocker } from './site-blocking';
import { SiteTracker } from './site-tracking';
import { Settings, Message } from './types';
console.log('Focus Flow: Background script initialized');
class BackgroundService {
  private timerManager: TimerManager;
  private siteBlocker: SiteBlocker;
  private siteTracker: SiteTracker;
  private settings: Settings;

  constructor() {
    this.settings = {
      isEnabled: true,
      workDuration: 25,
      breakDuration: 5,
      mode: 'normal'
    };

    this.loadSettings();
    this.initializeServices();
    this.setupMessageListeners();
    this.setupTabListeners();
  }

  private loadSettings() {
    chrome.storage.sync.get(['settings'], (result) => {
      if (result.settings) {
        this.settings = result.settings;
        this.handleModeChange();
      }
    });
  }

  private initializeServices() {
    this.timerManager = new TimerManager();
    this.siteBlocker = new SiteBlocker(this.settings);
    this.siteTracker = new SiteTracker(this.settings);
  }

  private setupMessageListeners() {
    chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
      try {
        switch (message.type) {
          case 'SETTINGS_UPDATED':
            if (message.settings) {
              this.settings = message.settings;
              this.timerManager.updateNotificationSettings(message.settings.isEnabled);
              this.handleModeChange();
              sendResponse({ success: true });
            }
            break;
            
          case 'START_TIMER':
            if (message.timeLeft !== undefined) {
              this.timerManager.startTimer(
                message.timeLeft,
                !!message.isBreak,
                message.workDuration || 25 * 60,
                message.breakDuration || 5 * 60
              );
              sendResponse({ success: true });
            }
            break;

          case 'PAUSE_TIMER':
            this.timerManager.pauseTimer();
            sendResponse({ success: true });
            break;

          case 'RESET_TIMER':
            if (message.timeLeft !== undefined) {
              this.timerManager.resetTimer(
                message.timeLeft,
                message.workDuration || 25 * 60,
                message.breakDuration || 5 * 60
              );
              sendResponse({ success: true });
            }
            break;

          case 'GET_TIMER_STATE':
            sendResponse(this.timerManager.getTimerState());
            break;
        }
      } catch (error) {
        console.error('Error handling message:', error);
        sendResponse({ error: 'Internal error' });
      }
      return true;
    });
  }

  private setupTabListeners() {
    chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
      if (changeInfo.url) {
        await this.siteBlocker.handleSiteAccess(tab);
      }
    });
  }

  private async handleModeChange() {
    this.siteBlocker.resetCreativeModeTimes();
    
    if (this.settings.mode === 'deepWork') {
      await this.siteBlocker.blockAllDistractingSites();
    }
  }
}

// Initialize the background service
new BackgroundService();