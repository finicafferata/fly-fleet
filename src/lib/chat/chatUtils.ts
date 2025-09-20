import { useEffect, useRef, useState, useCallback } from 'react';

// Chat utility types
export interface ChatConnection {
  id: string;
  socket: WebSocket | null;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  reconnectAttempts: number;
  lastPing: number;
}

export interface ChatConfig {
  apiUrl: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  pingInterval?: number;
  messageRetryAttempts?: number;
  enableNotifications?: boolean;
  respectUserPreferences?: boolean;
}

export interface UseChatReturn {
  isConnected: boolean;
  connectionStatus: ChatConnection['status'];
  sendMessage: (content: string, type?: string, metadata?: any) => Promise<void>;
  connect: () => void;
  disconnect: () => void;
  retry: () => void;
  lastError: string | null;
}

// Real-time chat hook with accessibility considerations
export function useChat(
  chatId: string,
  userId: string,
  config: ChatConfig,
  onMessage?: (message: any) => void,
  onParticipantUpdate?: (participants: any[]) => void,
  onTyping?: (userId: string, isTyping: boolean) => void
): UseChatReturn {
  const {
    apiUrl,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    pingInterval = 30000,
    messageRetryAttempts = 3,
    enableNotifications = true,
    respectUserPreferences = true
  } = config;

  const [connection, setConnection] = useState<ChatConnection>({
    id: '',
    socket: null,
    status: 'disconnected',
    reconnectAttempts: 0,
    lastPing: 0
  });
  const [lastError, setLastError] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const pingIntervalRef = useRef<NodeJS.Timeout>();
  const messageQueueRef = useRef<Array<{ content: string; type: string; metadata?: any; retries: number }>>([]);

  // Check user preferences for motion and notifications
  const getUserPreferences = useCallback(() => {
    if (!respectUserPreferences || typeof window === 'undefined') {
      return { prefersReducedMotion: false, notificationsEnabled: enableNotifications };
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const notificationsEnabled = enableNotifications && Notification.permission === 'granted';

    return { prefersReducedMotion, notificationsEnabled };
  }, [enableNotifications, respectUserPreferences]);

  // Connect to chat websocket
  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    setConnection(prev => ({ ...prev, status: 'connecting' }));
    setLastError(null);

    try {
      const wsUrl = `${apiUrl.replace('http', 'ws')}/chat/${chatId}?userId=${userId}`;
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        setConnection(prev => ({
          ...prev,
          socket,
          status: 'connected',
          reconnectAttempts: 0,
          lastPing: Date.now()
        }));

        // Start ping interval
        pingIntervalRef.current = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'ping' }));
            setConnection(prev => ({ ...prev, lastPing: Date.now() }));
          }
        }, pingInterval);

        // Process queued messages
        processMessageQueue();

        // Announce connection to screen readers
        announceConnectionChange('connected');
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleIncomingMessage(data);
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      };

      socket.onclose = (event) => {
        setConnection(prev => ({ ...prev, status: 'disconnected', socket: null }));

        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }

        // Attempt reconnection if not intentional
        if (event.code !== 1000 && connection.reconnectAttempts < maxReconnectAttempts) {
          scheduleReconnect();
        } else {
          announceConnectionChange('disconnected');
        }
      };

      socket.onerror = (error) => {
        setLastError('Connection error occurred');
        setConnection(prev => ({ ...prev, status: 'error' }));
        announceConnectionChange('error');
      };

      socketRef.current = socket;

    } catch (error) {
      setLastError('Failed to establish connection');
      setConnection(prev => ({ ...prev, status: 'error' }));
    }
  }, [apiUrl, chatId, userId, pingInterval, maxReconnectAttempts, connection.reconnectAttempts]);

  // Disconnect from chat
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }

    if (socketRef.current) {
      socketRef.current.close(1000, 'User disconnect');
      socketRef.current = null;
    }

    setConnection(prev => ({ ...prev, status: 'disconnected', socket: null }));
  }, []);

  // Schedule reconnection
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const delay = Math.min(reconnectInterval * Math.pow(2, connection.reconnectAttempts), 30000);

    reconnectTimeoutRef.current = setTimeout(() => {
      setConnection(prev => ({ ...prev, reconnectAttempts: prev.reconnectAttempts + 1 }));
      connect();
    }, delay);
  }, [connect, reconnectInterval, connection.reconnectAttempts]);

  // Handle incoming messages
  const handleIncomingMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'message':
        onMessage?.(data.payload);
        showNotification(data.payload);
        break;

      case 'participant_update':
        onParticipantUpdate?.(data.payload.participants);
        break;

      case 'typing':
        onTyping?.(data.payload.userId, data.payload.isTyping);
        break;

      case 'pong':
        // Handle ping response
        break;

      case 'error':
        setLastError(data.payload.message);
        announceError(data.payload.message);
        break;

      default:
        console.log('Unknown message type:', data.type);
    }
  }, [onMessage, onParticipantUpdate, onTyping]);

  // Send message
  const sendMessage = useCallback(async (content: string, type = 'text', metadata?: any) => {
    const message = {
      content,
      type,
      metadata,
      retries: 0
    };

    if (connection.status === 'connected' && socketRef.current) {
      try {
        socketRef.current.send(JSON.stringify({
          type: 'message',
          payload: {
            content,
            messageType: type,
            metadata,
            timestamp: new Date().toISOString()
          }
        }));
      } catch (error) {
        // Queue message for retry
        messageQueueRef.current.push(message);
        throw new Error('Failed to send message');
      }
    } else {
      // Queue message for when connection is restored
      messageQueueRef.current.push(message);
      throw new Error('Not connected');
    }
  }, [connection.status]);

  // Process queued messages
  const processMessageQueue = useCallback(() => {
    const queue = messageQueueRef.current;
    messageQueueRef.current = [];

    queue.forEach(async (message) => {
      if (message.retries < messageRetryAttempts) {
        try {
          await sendMessage(message.content, message.type, message.metadata);
        } catch (error) {
          message.retries++;
          if (message.retries < messageRetryAttempts) {
            messageQueueRef.current.push(message);
          }
        }
      }
    });
  }, [sendMessage, messageRetryAttempts]);

  // Show notification for new messages
  const showNotification = useCallback((message: any) => {
    const { notificationsEnabled } = getUserPreferences();

    if (!notificationsEnabled || message.sender.id === userId) return;

    try {
      const notification = new Notification(`New message from ${message.sender.name}`, {
        body: message.content.slice(0, 100),
        icon: '/icons/chat-notification.png',
        tag: `chat-${chatId}`,
        requireInteraction: false
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    } catch (error) {
      console.log('Notification failed:', error);
    }
  }, [chatId, userId, getUserPreferences]);

  // Announce connection changes to screen readers
  const announceConnectionChange = useCallback((status: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';

    switch (status) {
      case 'connected':
        announcement.textContent = 'Chat connected';
        break;
      case 'disconnected':
        announcement.textContent = 'Chat disconnected';
        break;
      case 'error':
        announcement.textContent = 'Chat connection error';
        break;
    }

    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 2000);
  }, []);

  // Announce errors to screen readers
  const announceError = useCallback((message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('role', 'alert');
    announcement.className = 'sr-only';
    announcement.textContent = `Chat error: ${message}`;

    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 5000);
  }, []);

  // Retry connection
  const retry = useCallback(() => {
    setLastError(null);
    setConnection(prev => ({ ...prev, reconnectAttempts: 0 }));
    connect();
  }, [connect]);

  // Initialize connection on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  // Handle visibility changes to manage connection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Reduce ping frequency when tab is hidden
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = setInterval(() => {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
              socketRef.current.send(JSON.stringify({ type: 'ping' }));
            }
          }, pingInterval * 2);
        }
      } else {
        // Resume normal ping frequency
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = setInterval(() => {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
              socketRef.current.send(JSON.stringify({ type: 'ping' }));
            }
          }, pingInterval);
        }

        // Reconnect if disconnected while hidden
        if (connection.status === 'disconnected') {
          connect();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [connect, connection.status, pingInterval]);

  return {
    isConnected: connection.status === 'connected',
    connectionStatus: connection.status,
    sendMessage,
    connect,
    disconnect,
    retry,
    lastError
  };
}

// Chat message utilities
export const chatUtils = {
  // Format message timestamp
  formatTimestamp: (date: Date, locale = 'en-US') => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Generate message ID
  generateMessageId: () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Sanitize message content
  sanitizeContent: (content: string) => {
    // Basic HTML sanitization - in production, use a proper library like DOMPurify
    return content
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  // Detect URLs in text
  linkifyText: (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  },

  // Validate file upload
  validateFile: (file: File, maxSize = 10 * 1024 * 1024, allowedTypes = ['image/*', 'application/pdf', 'text/*']) => {
    if (file.size > maxSize) {
      throw new Error(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
    }

    const isAllowed = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isAllowed) {
      throw new Error('File type not allowed');
    }

    return true;
  },

  // Generate typing indicator
  generateTypingId: (userId: string, chatId: string) => {
    return `typing_${chatId}_${userId}`;
  }
};

// Typing indicator hook
export function useTypingIndicator(
  sendTyping: (isTyping: boolean) => void,
  delay = 2000
) {
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const startTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      sendTyping(true);
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set timeout to stop typing
    timeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTyping(false);
    }, delay);
  }, [isTyping, sendTyping, delay]);

  const stopTyping = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (isTyping) {
      setIsTyping(false);
      sendTyping(false);
    }
  }, [isTyping, sendTyping]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { startTyping, stopTyping, isTyping };
}

// Chat persistence utilities
export class ChatStorage {
  private storageKey: string;

  constructor(chatId: string) {
    this.storageKey = `chat_${chatId}`;
  }

  // Save messages to local storage
  saveMessages(messages: any[]) {
    try {
      const data = {
        messages,
        timestamp: Date.now()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save chat messages:', error);
    }
  }

  // Load messages from local storage
  loadMessages(): any[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];

      const data = JSON.parse(stored);
      const age = Date.now() - data.timestamp;

      // Only return messages if they're less than 24 hours old
      if (age < 24 * 60 * 60 * 1000) {
        return data.messages || [];
      }

      // Clean up old data
      this.clearMessages();
      return [];
    } catch (error) {
      console.warn('Failed to load chat messages:', error);
      return [];
    }
  }

  // Clear stored messages
  clearMessages() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.warn('Failed to clear chat messages:', error);
    }
  }

  // Save draft message
  saveDraft(content: string) {
    try {
      localStorage.setItem(`${this.storageKey}_draft`, content);
    } catch (error) {
      console.warn('Failed to save draft:', error);
    }
  }

  // Load draft message
  loadDraft(): string {
    try {
      return localStorage.getItem(`${this.storageKey}_draft`) || '';
    } catch (error) {
      console.warn('Failed to load draft:', error);
      return '';
    }
  }

  // Clear draft
  clearDraft() {
    try {
      localStorage.removeItem(`${this.storageKey}_draft`);
    } catch (error) {
      console.warn('Failed to clear draft:', error);
    }
  }
}