'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { AccessibleChat, type ChatMessage, type ChatParticipant } from './AccessibleChat';
// import { useChat, ChatStorage, chatUtils } from '../lib/chat/chatUtils';

// Mock implementations for missing chat utilities
const useChat = (...args: any[]) => ({
  messages: [],
  sendMessage: async (content: string, type?: string, metadata?: any) => {},
  isConnected: false,
  lastError: null
});

class ChatStorage {
  constructor(sessionId: string) {}
  saveMessage() {}
  saveMessages(messages: any[]) {}
  getMessages() { return []; }
  loadMessages() { return []; }
}

const chatUtils = {
  formatMessage: (msg: any) => msg,
  generateMessageId: () => Math.random().toString(36),
  sanitizeContent: (content: string) => content,
  validateFile: (file: File) => true
};

// Widget-specific types
export interface ChatWidgetProps {
  apiUrl: string;
  userId?: string;
  userInfo?: {
    name: string;
    email: string;
    avatar?: string;
  };
  department?: 'sales' | 'support' | 'billing';
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'light' | 'dark' | 'auto';
  autoOpen?: boolean;
  showNotifications?: boolean;
  offlineMessage?: string;
  businessHours?: {
    timezone: string;
    days: Record<string, { open: string; close: string } | null>;
  };
  minimized?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

export function ChatWidget({
  apiUrl,
  userId,
  userInfo,
  department = 'support',
  className,
  position = 'bottom-right',
  theme = 'auto',
  autoOpen = false,
  showNotifications = true,
  offlineMessage,
  businessHours,
  minimized: initialMinimized = true,
  onToggle
}: ChatWidgetProps) {
  const t = useTranslations('chatWidget');
  const [isOpen, setIsOpen] = useState(!initialMinimized || autoOpen);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [currentUser, setCurrentUser] = useState<ChatParticipant | null>(null);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [isBusinessHours, setIsBusinessHours] = useState(true);

  // Generate session ID if no userId provided
  const sessionId = useMemo(() => {
    return userId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, [userId]);

  // Create chat storage instance
  const chatStorage = useMemo(() => new ChatStorage(sessionId), [sessionId]);

  // Initialize current user
  useEffect(() => {
    const user: ChatParticipant = {
      id: sessionId,
      name: userInfo?.name || 'You',
      type: 'user',
      status: 'online',
      avatar: userInfo?.avatar
    };
    setCurrentUser(user);
  }, [sessionId, userInfo]);

  // Load persisted messages
  useEffect(() => {
    const savedMessages = chatStorage.loadMessages();
    if (savedMessages.length > 0) {
      setMessages(savedMessages);
    }
  }, [chatStorage]);

  // Check business hours
  useEffect(() => {
    if (!businessHours) return;

    const checkBusinessHours = () => {
      const now = new Date();
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const businessTimezone = businessHours.timezone;

      // Convert current time to business timezone
      const businessTime = new Date(now.toLocaleString('en-US', { timeZone: businessTimezone }));
      const dayOfWeek = businessTime.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const currentTime = businessTime.toTimeString().slice(0, 5);

      const todayHours = businessHours.days[dayOfWeek];
      if (!todayHours) {
        setIsBusinessHours(false);
        return;
      }

      const isOpen = currentTime >= todayHours.open && currentTime <= todayHours.close;
      setIsBusinessHours(isOpen);
    };

    checkBusinessHours();
    const interval = setInterval(checkBusinessHours, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [businessHours]);

  // Chat connection
  const {
    isConnected,
    sendMessage,
    lastError
  } = useChat(
    sessionId,
    sessionId,
    {
      apiUrl,
      enableNotifications: showNotifications,
      respectUserPreferences: true
    },
    useCallback((message: any) => {
      const chatMessage: ChatMessage = {
        id: message.id || chatUtils.generateMessageId(),
        content: message.content,
        sender: {
          id: message.sender.id,
          name: message.sender.name,
          type: message.sender.type || 'agent',
          avatar: message.sender.avatar
        },
        timestamp: new Date(message.timestamp || Date.now()),
        type: message.type || 'text',
        status: 'delivered',
        metadata: message.metadata
      };

      setMessages(prev => {
        const updated = [...prev, chatMessage];
        chatStorage.saveMessages(updated);
        return updated;
      });

      // Mark as having new messages if widget is closed
      if (!isOpen && chatMessage.sender.id !== sessionId) {
        setHasNewMessages(true);
      }
    }, [chatStorage, isOpen, sessionId]),
    useCallback((updatedParticipants: any[]) => {
      setParticipants(updatedParticipants.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type || 'agent',
        status: p.status || 'online',
        avatar: p.avatar,
        lastSeen: p.lastSeen ? new Date(p.lastSeen) : undefined
      })));
    }, [])
  );

  // Handle sending messages
  const handleSendMessage = useCallback(async (content: string, type: ChatMessage['type'] = 'text') => {
    if (!currentUser) return;

    const messageId = chatUtils.generateMessageId();
    const message: ChatMessage = {
      id: messageId,
      content: chatUtils.sanitizeContent(content),
      sender: currentUser,
      timestamp: new Date(),
      type,
      status: 'sending'
    };

    // Add message optimistically
    setMessages(prev => {
      const updated = [...prev, message];
      chatStorage.saveMessages(updated);
      return updated;
    });

    try {
      await sendMessage(content, type, {
        userInfo,
        department,
        sessionId
      });

      // Update message status to sent
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, status: 'sent' as const } : msg
      ));
    } catch (error) {
      // Update message status to failed
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, status: 'failed' as const } : msg
      ));
    }
  }, [currentUser, sendMessage, userInfo, department, sessionId, chatStorage]);

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File): Promise<string> => {
    try {
      chatUtils.validateFile(file);

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sessionId', sessionId);

      // Upload file
      const response = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const { fileUrl } = await response.json();

      // Send file message
      await handleSendMessage(file.name, file.type.startsWith('image/') ? 'image' : 'file');

      return fileUrl;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Upload failed');
    }
  }, [apiUrl, sessionId, handleSendMessage]);

  // Toggle widget
  const handleToggle = useCallback(() => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    setHasNewMessages(false);
    onToggle?.(newIsOpen);

    // Announce to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = newIsOpen ? t('opened') : t('closed');
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  }, [isOpen, onToggle, t]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      handleToggle();
    }
  }, [isOpen, handleToggle]);

  // Get position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      default:
        return 'bottom-4 right-4';
    }
  };

  // Get theme classes
  const getThemeClasses = () => {
    if (theme === 'dark') return 'dark';
    if (theme === 'light') return '';
    // Auto theme - check system preference
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return '';
  };

  if (!currentUser) return null;

  return (
    <div
      className={clsx(
        'fixed z-50 flex flex-col',
        getPositionClasses(),
        getThemeClasses(),
        className
      )}
      onKeyDown={handleKeyDown}
    >
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 h-96 shadow-2xl rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
          {/* Header */}
          <div className="bg-navy-primary dark:bg-navy-primary-dark text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">{t('title')}</h3>
                <p className="text-xs opacity-90">
                  {isConnected
                    ? isBusinessHours
                      ? t('status.online')
                      : t('status.offline')
                    : t('status.connecting')
                  }
                </p>
              </div>
            </div>
            <button
              onClick={handleToggle}
              className="text-white/80 hover:text-white p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label={t('close')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Chat Content */}
          {isConnected ? (
            <AccessibleChat
              messages={messages}
              participants={participants}
              currentUser={currentUser}
              onSendMessage={handleSendMessage}
              onFileUpload={handleFileUpload}
              isConnected={isConnected}
              maxHeight="300px"
              showParticipants={false}
              placeholder={t('placeholder')}
              ariaLabel={t('ariaLabel')}
              className="border-0 shadow-none rounded-none"
            />
          ) : (
            <div className="h-full flex items-center justify-center p-4 text-center">
              <div>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-primary mx-auto mb-4" />
                <p className="text-neutral-medium">{t('connecting')}</p>
                {lastError && (
                  <p className="text-red-600 text-sm mt-2">{lastError}</p>
                )}
              </div>
            </div>
          )}

          {/* Offline Message */}
          {!isBusinessHours && offlineMessage && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800 p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                {offlineMessage}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={handleToggle}
        className={clsx(
          'w-14 h-14 bg-navy-primary hover:bg-navy-primary-dark text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-navy-primary/30',
          isOpen && 'scale-90'
        )}
        aria-label={isOpen ? t('close') : t('open')}
        aria-expanded={isOpen}
      >
        {/* New Messages Indicator */}
        {hasNewMessages && !isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        )}

        {/* Icon */}
        <div className={clsx('transition-transform duration-200', isOpen && 'rotate-180')}>
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2z"/>
            </svg>
          )}
        </div>
      </button>

      {/* Screen Reader Status Updates */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {!isConnected && t('status.disconnected')}
        {lastError && `Error: ${lastError}`}
      </div>
    </div>
  );
}