'use client';

import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, FileText } from 'lucide-react';

interface WelcomeScreenProps {
  onActionClick: (action: string, message: string) => void;
}

export function WelcomeScreen({ onActionClick }: WelcomeScreenProps) {
  const actions = [
    {
      id: 'review',
      label: 'Review my clips',
      message: 'Review my clips',
      icon: Sparkles,
    },
    {
      id: 'insights',
      label: 'Get writing insights',
      message: 'Get writing insights',
      icon: TrendingUp,
    },
    {
      id: 'guide',
      label: 'Create style guide',
      message: 'Create a style guide for me',
      icon: FileText,
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-fade-in">
      <div className="text-center space-y-6 max-w-2xl">
        {/* Sparkle Icon */}
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-primary/10 animate-scale-in">
            <Sparkles className="w-12 h-12 text-primary" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
            What would you like to know?
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
            Ask me to analyze your taste, find patterns, or generate a style guide.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="chat"
                size="xl"
                onClick={() => onActionClick(action.id, action.message)}
                className="justify-start text-left h-auto py-4"
              >
                <Icon className="w-5 h-5 mr-3 shrink-0" />
                <span>{action.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
