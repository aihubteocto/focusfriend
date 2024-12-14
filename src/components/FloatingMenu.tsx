import React, { useState } from 'react';
import { Timer } from '@/components/Timer';
import { TaskList } from '@/components/Task';
import { DistractionTracker } from '@/components/DistractionTracker';
import { TabGroup } from '@/components/TabGroup';
import { Timer as TimerIcon, ListTodo, BarChart, Plus } from 'lucide-react';

export const FloatingMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);

  const togglePanel = (panel: string) => {
    if (activePanel === panel) {
      setActivePanel(null);
    } else {
      setActivePanel(panel);
    }
  };

  // Add debug log
  console.log('Focus Flow: Rendering FloatingMenu component');

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '8px'
    }}>
      {/* Active Panel */}
      {activePanel && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '16px',
          minWidth: '300px',
          marginBottom: '8px'
        }}>
          {activePanel === 'timer' && <Timer />}
          {activePanel === 'tasks' && <TaskList />}
          {activePanel === 'analytics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <DistractionTracker />
              <TabGroup />
            </div>
          )}
        </div>
      )}

      {/* Menu Buttons */}
      {isOpen && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          marginBottom: '8px'
        }}>
          <button
            onClick={() => togglePanel('timer')}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: activePanel === 'timer' ? '#0066cc' : 'white',
              color: activePanel === 'timer' ? 'white' : '#0066cc',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          >
            <TimerIcon />
          </button>
          {/* Similar buttons for Tasks and Analytics */}
        </div>
      )}

      {/* Main Toggle Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setActivePanel(null);
        }}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#0066cc',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          transform: isOpen ? 'rotate(45deg)' : 'none',
          transition: 'transform 0.3s ease'
        }}
      >
        <Plus size={24} />
      </button>
    </div>
  );
};