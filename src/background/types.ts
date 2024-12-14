export interface TimerState {
  timeLeft: number;
  isRunning: boolean;
  isBreak: boolean;
  workDuration: number;
  breakDuration: number;
}
  
  export interface Settings {
    isEnabled: boolean;
    workDuration: number;
    breakDuration: number;
    mode: 'normal' | 'deepWork' | 'creative';
  }
  
  export interface Message {
    type: string;
    timeLeft?: number;
    isBreak?: boolean;
    settings?: Settings;
    workDuration?: number;
    breakDuration?: number;
  }