import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface TimeTracking {
  [key: string]: number;
}

export const DistractionTracker = () => {
  const [timeSpent, setTimeSpent] = useState<TimeTracking>({});
  const [currentSite, setCurrentSite] = useState<string>('');

  useEffect(() => {
    // Get initial data
    chrome.storage.local.get(['siteTimers'], (result) => {
      if (result.siteTimers) {
        setTimeSpent(result.siteTimers);
      }
    });

    // Get current tab
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (tab.url) {
        setCurrentSite(new URL(tab.url).hostname);
      }
    });

    // Listen for updates
    const storageListener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.siteTimers) {
        setTimeSpent(changes.siteTimers.newValue);
      }
    };

    chrome.storage.local.onChanged.addListener(storageListener);

    return () => {
      chrome.storage.local.onChanged.removeListener(storageListener);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours > 0 ? `${hours}h ` : ''}${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-4">
      {Object.entries(timeSpent).map(([site, time]) => (
        <div
          key={site}
          className={`flex items-center gap-2 p-4 ${
            site === currentSite ? 'bg-yellow-50' : 'bg-gray-50'
          } border rounded-lg`}
        >
          <AlertCircle className="w-5 h-5 text-yellow-500" />
          <div>
            <p className="text-sm font-medium text-gray-800">
              {site}
            </p>
            <p className="text-sm text-gray-600">
              Time today: {formatTime(time)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};