'use client';

import { User, Sparkles } from 'lucide-react';
import { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  component?: ReactNode; // For embedding interactive elements
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex gap-3 mb-4 animate-slide-in-bottom ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* Avatar - Left for assistant */}
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
        </div>
      )}

      {/* Message Content */}
      <div className={`flex flex-col max-w-[85%] md:max-w-[75%]`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-chat-user-bg text-chat-user-text rounded-br-md'
              : 'bg-chat-assistant-bg text-chat-assistant-text rounded-bl-md'
          }`}
        >
          {message.component ? (
            <div>{message.component}</div>
          ) : isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-p:leading-relaxed">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Timestamp (optional) */}
        {message.timestamp && (
          <span
            className={`text-xs text-muted-foreground mt-1 ${
              isUser ? 'text-right' : 'text-left'
            }`}
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
      </div>

      {/* Avatar - Right for user */}
      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      )}
    </div>
  );
}

// Loading indicator for typing
export function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4 animate-slide-in-bottom">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
      </div>
      <div className="bg-chat-assistant-bg text-chat-assistant-text rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
