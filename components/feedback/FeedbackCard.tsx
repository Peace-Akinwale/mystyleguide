'use client';

import { Feedback } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, truncateText } from '@/lib/utils';
import { MessageSquare } from 'lucide-react';

interface FeedbackCardProps {
  feedback: Feedback;
  onClick: () => void;
}

export function FeedbackCard({ feedback, onClick }: FeedbackCardProps) {
  return (
    <Card
      className="hover:bg-accent transition-colors cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <MessageSquare className="h-4 w-4" />
              <span>Editor Feedback</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDate(feedback.created_at)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">My Text:</p>
            <p className="text-sm line-clamp-2">
              {truncateText(feedback.my_text, 100)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Feedback:</p>
            <p className="text-sm text-red-600 dark:text-red-400 line-clamp-2">
              {truncateText(feedback.editor_feedback, 100)}
            </p>
          </div>
        </div>
        {feedback.tags && feedback.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {feedback.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
