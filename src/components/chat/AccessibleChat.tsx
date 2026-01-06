'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';

// Chat message types
export interface ChatMessage {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    type: 'user' | 'agent' | 'system';
    avatar?: string;
  };
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'system';
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  metadata?: {
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    imageAlt?: string;
  };
}

export interface ChatParticipant {
  id: string;
  name: string;
  type: 'user' | 'agent';
  status: 'online' | 'away' | 'offline';
  avatar?: string;
  lastSeen?: Date;
}

export interface AccessibleChatProps {
  messages: ChatMessage[];
  participants: ChatParticipant[];
  currentUser: ChatParticipant;
  onSendMessage: (content: string, type?: ChatMessage['type']) => void;
  onTyping?: (isTyping: boolean) => void;
  onFileUpload?: (file: File) => Promise<string>;
  isConnected?: boolean;
  isLoading?: boolean;
  className?: string;
  maxHeight?: string;
  showParticipants?: boolean;
  enableFileUpload?: boolean;
  enableEmoji?: boolean;
  placeholder?: string;
  ariaLabel?: string;
}

export function AccessibleChat({
  messages,
  participants,
  currentUser,
  onSendMessage,
  onTyping,
  onFileUpload,
  isConnected = true,
  isLoading = false,
  className,
  maxHeight = '500px',
  showParticipants = true,
  enableFileUpload = true,
  enableEmoji = false,
  placeholder,
  ariaLabel
}: AccessibleChatProps) {
  const t = useTranslations('chat');
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastReadMessageId, setLastReadMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, []);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
      block: 'end'
    });
  }, []);

  // Handle new messages
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];

      // Auto-scroll if user is near bottom or if it's user's own message
      if (messagesContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

        if (isNearBottom || lastMessage.sender.id === currentUser.id) {
          scrollToBottom();
        }
      }

      // Announce new messages to screen readers
      if (lastMessage.sender.id !== currentUser.id && lastMessage.type !== 'system') {
        announceNewMessage(lastMessage);
      }

      // Update unread count
      if (lastMessage.sender.id !== currentUser.id && !lastReadMessageId) {
        setUnreadCount(prev => prev + 1);
      }
    }
  }, [messages, currentUser.id, lastReadMessageId, scrollToBottom]);

  // Handle input changes with typing indicators
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);
    adjustTextareaHeight();

    // Handle typing indicator
    if (onTyping) {
      if (value.trim() && !isTyping) {
        setIsTyping(true);
        onTyping(true);
      }

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        if (isTyping) {
          setIsTyping(false);
          onTyping(false);
        }
      }, 2000);
    }
  }, [isTyping, onTyping, adjustTextareaHeight]);

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    const trimmedValue = inputValue.trim();
    if (!trimmedValue || !isConnected) return;

    onSendMessage(trimmedValue, 'text');
    setInputValue('');

    // Reset typing state
    if (isTyping) {
      setIsTyping(false);
      onTyping?.(false);
    }

    // Adjust textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    // Focus back to input
    inputRef.current?.focus();
  }, [inputValue, isConnected, onSendMessage, isTyping, onTyping]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setInputValue('');
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  }, [handleSubmit]);

  // Handle file upload
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onFileUpload) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      announceError(t('errors.fileTooLarge'));
      return;
    }

    try {
      const fileUrl = await onFileUpload(file);
      // The parent component should handle adding the file message
    } catch (error) {
      announceError(t('errors.uploadFailed'));
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onFileUpload, t]);

  // Mark messages as read when they come into view
  const handleMessageVisible = useCallback((messageId: string) => {
    setLastReadMessageId(messageId);
    setUnreadCount(0);
  }, []);

  // Announce new messages to screen readers
  const announceNewMessage = useCallback((message: ChatMessage) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = t('announcements.newMessage', {
      sender: message.sender.name,
      content: message.content.slice(0, 100)
    });

    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 3000);
  }, [t]);

  // Announce errors to screen readers
  const announceError = useCallback((message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('role', 'alert');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 5000);
  }, []);

  // Format timestamp for screen readers
  const formatTimestampForScreenReader = useCallback((date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }, []);

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    let currentDate = '';

    messages.forEach(message => {
      const messageDate = message.timestamp.toDateString();
      if (messageDate !== currentDate) {
        currentDate = messageDate;
        groups.push({ date: messageDate, messages: [message] });
      } else {
        groups[groups.length - 1].messages.push(message);
      }
    });

    return groups;
  }, [messages]);

  return (
    <div
      className={clsx(
        'flex flex-col bg-white rounded-lg shadow-lg border border-neutral-light',
        className
      )}
      style={{ maxHeight }}
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-light bg-neutral-light/20">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className={clsx(
              'w-3 h-3 rounded-full',
              isConnected ? 'bg-green-500' : 'bg-red-500'
            )} />
            <span className="sr-only">
              {isConnected ? t('status.connected') : t('status.disconnected')}
            </span>
          </div>
          <h2 className="font-semibold text-lg text-neutral-dark">
            {ariaLabel || t('title')}
          </h2>
          {unreadCount > 0 && (
            <span className="bg-navy-primary text-white text-xs rounded-full px-2 py-1">
              {unreadCount}
            </span>
          )}
        </div>

        {showParticipants && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-neutral-medium">
              {t('participants', { count: participants.length })}
            </span>
            <div className="flex -space-x-2">
              {participants.slice(0, 3).map(participant => (
                <div
                  key={participant.id}
                  className="relative w-8 h-8 rounded-full bg-navy-primary text-white flex items-center justify-center text-sm font-medium border-2 border-white"
                  title={participant.name}
                >
                  {participant.avatar ? (
                    <img
                      src={participant.avatar}
                      alt={participant.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    participant.name.charAt(0).toUpperCase()
                  )}
                  <div className={clsx(
                    'absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white',
                    participant.status === 'online' ? 'bg-green-500' :
                    participant.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                  )} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        role="log"
        aria-live="polite"
        aria-label={t('messagesArea')}
        tabIndex={0}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-navy-primary" />
            <span className="ml-2 text-neutral-medium">{t('loading')}</span>
          </div>
        ) : groupedMessages.length === 0 ? (
          <div className="text-center py-8 text-neutral-medium">
            <svg className="w-12 h-12 mx-auto mb-4 text-neutral-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>{t('noMessages')}</p>
          </div>
        ) : (
          groupedMessages.map(group => (
            <div key={group.date}>
              {/* Date Separator */}
              <div className="flex items-center justify-center mb-4">
                <div className="bg-neutral-light px-3 py-1 rounded-full">
                  <span className="text-xs text-neutral-medium font-medium">
                    {new Date(group.date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-3">
                {group.messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isOwn={message.sender.id === currentUser.id}
                    onVisible={() => handleMessageVisible(message.id)}
                    formatTimestamp={formatTimestampForScreenReader}
                  />
                ))}
              </div>
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center space-x-2 text-sm text-neutral-medium">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-neutral-medium rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-neutral-medium rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-neutral-medium rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            <span>
              {typingUsers.length === 1
                ? t('typing.single', { name: typingUsers[0] })
                : t('typing.multiple', { count: typingUsers.length })
              }
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="border-t border-neutral-light">
        <div className="p-4">
          <div className="flex items-end space-x-3">
            {/* File Upload */}
            {enableFileUpload && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!isConnected}
                className="flex-shrink-0 p-2 text-neutral-medium hover:text-navy-primary disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-navy-primary rounded-md"
                aria-label={t('attachFile')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
            )}

            {/* Text Input */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder || t('placeholder')}
                disabled={!isConnected}
                className="w-full min-h-[40px] max-h-[120px] px-3 py-2 border border-neutral-medium rounded-lg resize-none focus:ring-navy-primary focus:border-navy-primary disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={t('messageInput')}
                aria-describedby="input-help"
                rows={1}
              />
              <div id="input-help" className="sr-only">
                {t('inputHelp')}
              </div>
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputValue.trim() || !isConnected}
              className="flex-shrink-0 bg-navy-primary text-white p-2 rounded-lg hover:bg-navy-primary-dark disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-navy-primary focus:ring-offset-2 transition-colors"
              aria-label={t('sendMessage')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>

          {/* Connection Status */}
          {!isConnected && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 rounded-md p-2" role="alert">
              {t('status.disconnectedMessage')}
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
          aria-hidden="true"
        />
      </form>
    </div>
  );
}

// Individual chat message component
interface ChatMessageProps {
  message: ChatMessage;
  isOwn: boolean;
  onVisible: () => void;
  formatTimestamp: (date: Date) => string;
}

function ChatMessage({ message, isOwn, onVisible, formatTimestamp }: ChatMessageProps) {
  const t = useTranslations('chat');
  const messageRef = useRef<HTMLDivElement>(null);

  // Intersection observer for marking as read
  useEffect(() => {
    const messageElement = messageRef.current;
    if (!messageElement || isOwn) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onVisible();
          observer.unobserve(messageElement);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(messageElement);

    return () => observer.disconnect();
  }, [isOwn, onVisible]);

  const getStatusIcon = (status: ChatMessage['status']) => {
    switch (status) {
      case 'sending':
        return <div className="w-4 h-4 border-2 border-neutral-light border-t-navy-primary rounded-full animate-spin" />;
      case 'sent':
        return <svg className="w-4 h-4 text-neutral-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
      case 'delivered':
        return <svg className="w-4 h-4 text-navy-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
      case 'read':
        return <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>;
      case 'failed':
        return <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
      default:
        return null;
    }
  };

  return (
    <div
      ref={messageRef}
      className={clsx(
        'flex',
        isOwn ? 'justify-end' : 'justify-start'
      )}
      role="article"
      aria-labelledby={`message-${message.id}-sender`}
      aria-describedby={`message-${message.id}-content message-${message.id}-time`}
    >
      <div className={clsx(
        'max-w-xs lg:max-w-md',
        isOwn ? 'order-2' : 'order-1'
      )}>
        {/* Sender Info */}
        {!isOwn && (
          <div id={`message-${message.id}-sender`} className="text-xs text-neutral-medium mb-1 px-3">
            {message.sender.name}
          </div>
        )}

        {/* Message Bubble */}
        <div className={clsx(
          'rounded-lg px-3 py-2 break-words',
          isOwn
            ? 'bg-navy-primary text-white'
            : 'bg-neutral-light text-neutral-dark',
          message.type === 'system' && 'bg-yellow-50 text-yellow-800 border border-yellow-200'
        )}>
          {/* Message Content */}
          <div id={`message-${message.id}-content`}>
            {message.type === 'text' && (
              <p className="whitespace-pre-wrap">{message.content}</p>
            )}

            {message.type === 'image' && message.metadata?.fileUrl && (
              <div>
                <img
                  src={message.metadata.fileUrl}
                  alt={message.metadata.imageAlt || t('imageMessage')}
                  className="rounded-lg max-w-full h-auto"
                />
                {message.content && (
                  <p className="mt-2 whitespace-pre-wrap">{message.content}</p>
                )}
              </div>
            )}

            {message.type === 'file' && message.metadata?.fileUrl && (
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <a
                  href={message.metadata.fileUrl}
                  download={message.metadata.fileName}
                  className="underline hover:no-underline"
                >
                  {message.metadata.fileName}
                </a>
              </div>
            )}
          </div>

          {/* Timestamp and Status */}
          <div className="flex items-center justify-between mt-2 text-xs opacity-70">
            <time
              id={`message-${message.id}-time`}
              dateTime={message.timestamp.toISOString()}
              title={formatTimestamp(message.timestamp)}
            >
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </time>
            {isOwn && (
              <div className="ml-2" aria-label={t(`status.${message.status}`)}>
                {getStatusIcon(message.status)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}