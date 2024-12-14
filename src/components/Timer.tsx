// src/components/Timer.tsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlayCircle, PauseCircle, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const WORK_TIME_OPTIONS = [
  { value: "15", label: "15 minutes" },
  { value: "25", label: "25 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "60 minutes" },
];

const BREAK_TIME_OPTIONS = [
  { value: "5", label: "5 minutes" },
  { value: "10", label: "10 minutes" },
  { value: "15", label: "15 minutes" },
];

export const Timer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [selectedWorkTime, setSelectedWorkTime] = useState("25");
  const [selectedBreakTime, setSelectedBreakTime] = useState("5");
  const { toast } = useToast();

  // Load timer state on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const response = await chrome.runtime.sendMessage({ type: 'GET_TIMER_STATE' });
        if (response) {
          setTimeLeft(response.timeLeft);
          setIsRunning(response.isRunning);
          setIsBreak(response.isBreak);
          setSelectedWorkTime(String(Math.floor(response.workDuration / 60)));
          setSelectedBreakTime(String(Math.floor(response.breakDuration / 60)));
        }
      } catch (error) {
        console.error('Error loading timer state:', error);
      }
    };

    loadState();
  }, []);
  useEffect(() => {
    if (isRunning) {
      try {
        chrome.runtime.sendMessage({ 
          type: 'START_TIMER',
          timeLeft,
          isBreak,
          workDuration: parseInt(selectedWorkTime) * 60,
          breakDuration: parseInt(selectedBreakTime) * 60
        }).catch(() => {
          // Handle connection error
          setIsRunning(false);
        });
      } catch (error) {
        console.error('Error starting timer:', error);
        setIsRunning(false);
      }
    } else {
      try {
        chrome.runtime.sendMessage({ type: 'PAUSE_TIMER' }).catch(() => {
          // Silently fail on connection error
        });
      } catch (error) {
        console.error('Error pausing timer:', error);
      }
    }
  }, [isRunning]);

    // Listen for timer updates from background
    useEffect(() => {
      const handleMessage = (message: any) => {
        if (message.type === 'TIMER_UPDATE') {
          setTimeLeft(message.timeLeft);
          setIsBreak(message.isBreak);
          setIsRunning(message.isRunning);
  
          if (message.showNotification) {
            toast({
              title: message.isBreak ? "Work session completed!" : "Break time is over!",
              description: message.isBreak ? "Take a well-deserved break." : "Time to get back to work.",
            });
          }
        }
      };
  
      chrome.runtime.onMessage.addListener(handleMessage);
      return () => {
        try {
          chrome.runtime.onMessage.removeListener(handleMessage);
        } catch (error) {
          console.error('Error removing message listener:', error);
        }
      };
    }, [toast]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
        chrome.runtime.sendMessage({ 
          type: 'TIMER_TICK',
          timeLeft: timeLeft - 1
        });
      }, 1000);
    } else if (timeLeft === 0) {
      if (isBreak) {
        toast({
          title: "Break time is over!",
          description: "Time to get back to work.",
        });
        setTimeLeft(parseInt(selectedWorkTime) * 60);
        setIsBreak(false);
      } else {
        toast({
          title: "Work session completed!",
          description: "Take a well-deserved break.",
        });
        setTimeLeft(parseInt(selectedBreakTime) * 60);
        setIsBreak(true);
      }
      setIsRunning(false);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, selectedWorkTime, selectedBreakTime, toast]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = async () => {
    const workTime = parseInt(selectedWorkTime) * 60;
    setIsRunning(false);
    setTimeLeft(workTime);
    setIsBreak(false);
    
    try {
      await chrome.runtime.sendMessage({ 
        type: 'RESET_TIMER',
        timeLeft: workTime,
        workDuration: parseInt(selectedWorkTime) * 60,
        breakDuration: parseInt(selectedBreakTime) * 60
      });
    } catch (error) {
      console.error('Error resetting timer:', error);
    }
  };

  const handleWorkTimeChange = (value: string) => {
    if (!isRunning) {
      setSelectedWorkTime(value);
      setTimeLeft(parseInt(value) * 60);
    }
  };

  const handleBreakTimeChange = (value: string) => {
    setSelectedBreakTime(value);
  };

  const progress = (isBreak ? 
    (parseInt(selectedBreakTime) * 60 - timeLeft) / (parseInt(selectedBreakTime) * 60) : 
    (parseInt(selectedWorkTime) * 60 - timeLeft) / (parseInt(selectedWorkTime) * 60)) * 100;

  return (
    <div className="flex flex-col items-center space-y-6 p-6 bg-secondary rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-primary">
        {isBreak ? "Break Time" : "Focus Time"}
      </h2>

      {/* Time Selection */}
      {!isRunning && !isBreak && (
        <div className="flex gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm">Work Duration</label>
            <Select value={selectedWorkTime} onValueChange={handleWorkTimeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WORK_TIME_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm">Break Duration</label>
            <Select value={selectedBreakTime} onValueChange={handleBreakTimeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BREAK_TIME_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Timer Display */}
      <div className="relative w-48 h-48">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-4xl font-bold text-primary">
            {formatTime(timeLeft)}
          </div>
        </div>
        <svg className="transform -rotate-90 w-48 h-48">
          <circle
            className="text-gray-200"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r="90"
            cx="96"
            cy="96"
          />
          <circle
            className="text-primary"
            strokeWidth="8"
            strokeDasharray={565.48}
            strokeDashoffset={565.48 * (1 - progress / 100)}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="90"
            cx="96"
            cy="96"
          />
        </svg>
      </div>

      {/* Controls */}
      <div className="flex space-x-4">
        <Button
          onClick={toggleTimer}
          className="bg-primary hover:bg-primary-hover text-white"
        >
          {isRunning ? (
            <PauseCircle className="w-6 h-6" />
          ) : (
            <PlayCircle className="w-6 h-6" />
          )}
        </Button>
        <Button
          onClick={resetTimer}
          variant="outline"
          className="border-primary text-primary hover:bg-primary hover:text-white"
        >
          <RotateCcw className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};