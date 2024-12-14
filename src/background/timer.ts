import { TimerState } from './types';

export class TimerManager {
  private timerInterval: NodeJS.Timeout | null = null;
  private currentTimerState: TimerState = {
    timeLeft: 25 * 60,
    isRunning: false,
    isBreak: false,
    workDuration: 25 * 60,
    breakDuration: 5 * 60
  };
  private notificationsEnabled: boolean = true;

  constructor() {
    this.initializeTimer();
    this.loadNotificationSettings();

  }

  private loadNotificationSettings() {
    chrome.storage.sync.get(['settings'], (result) => {
      if (result.settings) {
        this.notificationsEnabled = result.settings.isEnabled;
      }
    });
  }

  public updateNotificationSettings(enabled: boolean) {
    this.notificationsEnabled = enabled;
    // Save the updated setting
    chrome.storage.sync.set({
      settings: {
        isEnabled: enabled
      }
    });
  }

  private initializeTimer() {
    chrome.storage.local.get(['timerState'], (result) => {
      if (result.timerState) {
        this.currentTimerState = result.timerState;
        if (this.currentTimerState.isRunning) {
          this.startBackgroundTimer();
        }
        this.updateBadgeText(this.currentTimerState.timeLeft);
      }
    });
  }

  private broadcastTimerUpdate(showNotification = false) {
    // Only send notification flag if notifications are enabled
    chrome.runtime.sendMessage({
      type: 'TIMER_UPDATE',
      ...this.currentTimerState,
      showNotification: showNotification && this.notificationsEnabled
    }).catch(() => {
      // Silently fail if popup is closed
    });
  }

  public startTimer(timeLeft: number, isBreak: boolean, workDuration: number, breakDuration: number) {
    this.currentTimerState = {
      timeLeft,
      isRunning: true,
      isBreak,
      workDuration,
      breakDuration
    };
    this.startBackgroundTimer();
    this.saveState();
  }

  public pauseTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.currentTimerState.isRunning = false;
    this.saveState();
  }

  public resetTimer(timeLeft: number, workDuration: number, breakDuration: number) {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.currentTimerState = {
      timeLeft,
      isRunning: false,
      isBreak: false,
      workDuration,
      breakDuration
    };
    this.saveState();
    this.updateBadgeText(this.currentTimerState.timeLeft);
  }

  public getTimerState(): TimerState {
    return this.currentTimerState;
  }

  private startBackgroundTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = setInterval(() => {
      if (this.currentTimerState.timeLeft > 0) {
        this.currentTimerState.timeLeft--;
        this.updateBadgeText(this.currentTimerState.timeLeft);
        this.saveState();
        this.broadcastTimerUpdate();
      } else {
        this.handleTimerComplete();
      }
    }, 1000);
  }

  private handleTimerComplete() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    
    // Switch between work and break
    this.currentTimerState.isBreak = !this.currentTimerState.isBreak;
    this.currentTimerState.timeLeft = this.currentTimerState.isBreak 
      ? this.currentTimerState.breakDuration 
      : this.currentTimerState.workDuration;
    this.currentTimerState.isRunning = false;
    
    this.saveState();

    // Only show notification if enabled
    if (this.notificationsEnabled) {
      this.showNotification();
    }
    
    // Always broadcast timer update, but only with notification if enabled
    this.broadcastTimerUpdate(this.notificationsEnabled);
  }

  private showNotification() {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon48.png',
      title: this.currentTimerState.isBreak ? 'Work Session Complete!' : 'Break Time Over!',
      message: this.currentTimerState.isBreak ? 'Time for a break!' : 'Time to get back to work!',
    });
  }

  private updateBadgeText(timeLeft: number) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    try {
      chrome.action.setBadgeText({
        text: `${minutes}:${seconds.toString().padStart(2, '0')}`
      });
    } catch (error) {
      console.error('Error updating badge:', error);
    }
  }

  private saveState() {
    try {
      chrome.storage.local.set({ timerState: this.currentTimerState });
    } catch (error) {
      console.error('Error saving timer state:', error);
    }
  }
}