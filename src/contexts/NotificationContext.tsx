import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useNotificationHub as useNotificationHubBase } from '@/hooks/useNotificationHub';
import type { UseNotificationHubReturn } from '@/hooks/useNotificationHub';
import type { NotificationDto, AssignmentNotificationDto, ExamNotificationDto, GradeNotificationDto, AnnouncementDto } from '@/types/notification.types';

const NotificationContext = createContext<UseNotificationHubReturn | null>(null);

function playTingTing() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    // Resume audio context if user already interacted, otherwise it might fail silently
    const audioCtx = new AudioContextClass();
    
    const playTone = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, startTime);
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.5, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    const now = audioCtx.currentTime;
    // Pleasant "Ding-Dong" or "Ting-Ting"
    playTone(880, now, 0.4); 
    playTone(1760, now, 0.4); 
    playTone(1046.50, now + 0.15, 0.5); 
    playTone(2093, now + 0.15, 0.5); 
  } catch (e) {
    console.error("Audio playback failed", e);
  }
}

let blinkInterval: NodeJS.Timeout | null = null;
const originalTitle = document.title || 'EduConnect';

function startTitleBlink(message: string) {
  if (blinkInterval) clearInterval(blinkInterval);
  let isOriginal = false;
  
  blinkInterval = setInterval(() => {
    document.title = isOriginal ? originalTitle : `🔔 ${message}`;
    isOriginal = !isOriginal;
  }, 1000);

  // Stop blinking when user focuses the window or moves mouse
  const handleFocus = () => {
    if (blinkInterval) clearInterval(blinkInterval);
    document.title = originalTitle;
    window.removeEventListener('focus', handleFocus);
    window.removeEventListener('click', handleFocus);
    window.removeEventListener('keydown', handleFocus);
  };
  
  window.addEventListener('focus', handleFocus);
  window.addEventListener('click', handleFocus);
  window.addEventListener('keydown', handleFocus);
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const handleReceiveNotification = (dto: NotificationDto) => {
    // If it's a message, or generally any notification
    if (dto.type === 'Message') {
      playTingTing();
      startTitleBlink("You have a new message!");
    } else {
      playTingTing();
      startTitleBlink(dto.title);
    }
  };

  const hookData = useNotificationHubBase({
    onReceiveNotification: handleReceiveNotification,
    onAssignmentNotification: (dto) => {
      playTingTing();
      startTitleBlink("New Assignment!");
    },
    onExamNotification: (dto) => {
      playTingTing();
      startTitleBlink("New Exam Notification!");
    },
    onGradeNotification: (dto) => {
      playTingTing();
      startTitleBlink("New Grade Update!");
    },
    onSystemAnnouncement: (dto) => {
      playTingTing();
      startTitleBlink("New Announcement!");
    }
  });

  return (
    <NotificationContext.Provider value={hookData}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationHub() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationHub must be used within a NotificationProvider');
  }
  return context;
}
