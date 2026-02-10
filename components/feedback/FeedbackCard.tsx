'use client';

import { Feedback } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, truncateText } from '@/lib/utils';
import { User, Lightbulb } from 'lucide-react';

interface FeedbackCardProps {
  feedback: Feedback;
  onClick: () => void;
}

export function FeedbackCard({ feedback, onClick }: FeedbackCardProps) {
  return (
    <Card
      className="hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <Badge variant="secondary" className="mb-2">
              Editor Feedback
            </Badge>
            <p className="text-xs text-muted-foreground">
              {formatDate(feedback.created_at)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              My Text
            </span>
          </div>
          <p className="text-sm leading-relaxed line-clamp-2">
            {truncateText(feedback.my_text, 150)}
          </p>
        </div>

        <div className="h-px bg-border" />

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
              Feedback
            </span>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg">
            <p className="text-sm leading-relaxed text-amber-900 dark:text-amber-100 line-clamp-3">
              {truncateText(feedback.editor_feedback, 150)}
            </p>
          </div>
        </div>

        {feedback.tags && feedback.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {feedback.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs px-2 py-0.5"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
