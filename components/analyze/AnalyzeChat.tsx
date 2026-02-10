'use client';

import { useState, useRef, useEffect } from 'react';
import { WelcomeScreen } from './WelcomeScreen';
import { ChatMessage, Message, TypingIndicator } from './ChatMessage';
import { FocusAreaSelector } from './FocusAreaSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Sparkles, TrendingUp, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface AnalyzeChatProps {
  clipCount: number;
  feedbackCount: number;
}

type ConversationState = 'welcome' | 'focus_selection' | 'analyzing' | 'results' | 'chat';

export function AnalyzeChat({ clipCount, feedbackCount }: AnalyzeChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [state, setState] = useState<ConversationState>('welcome');
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const addMessage = (role: 'user' | 'assistant', content: string, component?: any) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      component,
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  const handleActionClick = (action: string, message: string) => {
    setCurrentAction(action);
    addMessage('user', message);
    setState('focus_selection');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      const response = `Great! I'll ${action === 'review' ? 'review your clips and show you patterns' : action === 'insights' ? 'analyze your writing for deep insights' : 'create a permanent style guide'} based on your ${clipCount} clips${feedbackCount > 0 ? ` and ${feedbackCount} feedback items` : ''}.\n\nWhich areas should I focus on?`;

      addMessage('assistant', response, <FocusAreaSelector onSubmit={handleFocusSubmit} onSkip={handleFocusSkip} />);
    }, 800);
  };

  const handleFocusSubmit = async (selectedAreas: string[]) => {
    const areaLabels = selectedAreas.length > 0
      ? selectedAreas.map(id => {
          const area = [
            { id: 'sentence_structure', label: 'Sentence Structure' },
            { id: 'rhetorical_devices', label: 'Rhetorical Devices' },
            { id: 'tone_voice', label: 'Tone & Voice' },
            { id: 'word_choice', label: 'Word Choice' },
            { id: 'metaphors', label: 'Metaphors & Analogies' },
            { id: 'rhythm_pacing', label: 'Rhythm & Pacing' },
          ].find(a => a.id === id);
          return area?.label || id;
        }).join(', ')
      : 'all areas';

    addMessage('user', `Focus on: ${areaLabels}`);
    await performAnalysis(selectedAreas);
  };

  const handleFocusSkip = async () => {
    addMessage('user', 'Skip focus areas - analyze everything');
    await performAnalysis([]);
  };

  const performAnalysis = async (focusAreas: string[]) => {
    setState('analyzing');
    setIsTyping(true);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clipIds: [], // Will be fetched on server
          feedbackIds: [],
          focusAreas,
          includeFeedback: feedbackCount > 0,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze');
      }

      const data = await response.json();
      setAnalysisResult(data);

      setIsTyping(false);
      setState('results');

      addMessage('assistant', data.claudeResponse || 'Analysis complete!');

      toast({
        title: 'Analysis Complete',
        description: 'Your writing has been analyzed successfully',
      });
    } catch (error) {
      setIsTyping(false);
      addMessage('assistant', 'Sorry, I encountered an error while analyzing. Please try again.');
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to analyze',
        variant: 'destructive',
      });
      setState('chat');
    }
  };

  const handleGenerateStyleGuide = async () => {
    addMessage('user', 'Generate style guide');
    setIsTyping(true);

    try {
      const response = await fetch('/api/style-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clipIds: [],
          feedbackIds: [],
          title: 'My Writing Style Guide',
          includeFeedback: feedbackCount > 0,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate style guide');
      }

      setIsTyping(false);
      addMessage('assistant', 'Style guide generated! Redirecting you now...');

      toast({
        title: 'Success',
        description: 'Style guide generated successfully',
      });

      setTimeout(() => {
        router.push('/guide');
      }, 1000);
    } catch (error) {
      setIsTyping(false);
      addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate',
        variant: 'destructive',
      });
    }
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    addMessage('user', userMessage);

    // Simple response logic
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage('assistant', "I'm here to help you analyze your writing! Use the action buttons above to get started, or ask me a specific question about your writing style.");
    }, 800);
  };

  const totalItems = clipCount + feedbackCount;

  return (
    <div className="flex flex-col h-full">
      {/* Show welcome screen only if no messages */}
      {messages.length === 0 && state === 'welcome' && (
        <WelcomeScreen onActionClick={handleActionClick} />
      )}

      {/* Action Buttons - Sticky at top during conversation */}
      {messages.length > 0 && (
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b pb-3 mb-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="chat"
              size="sm"
              onClick={() => handleActionClick('review', 'Review my clips')}
              disabled={isTyping || state === 'analyzing'}
              className="flex-1 sm:flex-none"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Review my clips
            </Button>
            <Button
              variant="chat"
              size="sm"
              onClick={() => handleActionClick('insights', 'Get writing insights')}
              disabled={isTyping || state === 'analyzing'}
              className="flex-1 sm:flex-none"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Get writing insights
            </Button>
            <Button
              variant="chat"
              size="sm"
              onClick={handleGenerateStyleGuide}
              disabled={isTyping || state === 'analyzing'}
              className="flex-1 sm:flex-none"
            >
              <FileText className="w-4 h-4 mr-2" />
              Create style guide
            </Button>
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto pb-4 space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Area - Always visible */}
      {messages.length > 0 && (
        <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t pt-4 mt-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your taste..."
              className="flex-1 h-12 rounded-xl border-2 focus:border-primary"
              disabled={isTyping}
            />
            <Button
              type="submit"
              size="icon-lg"
              disabled={!input.trim() || isTyping}
              className="rounded-xl"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      )}

      {/* Empty State Warning */}
      {totalItems === 0 && messages.length === 0 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-center">
          <p className="text-sm text-muted-foreground">
            Add some clips or feedback first to get started
          </p>
        </div>
      )}
    </div>
  );
}
