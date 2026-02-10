'use client';

import Link from 'next/link';
import { Clip } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, truncateText } from '@/lib/utils';
import { ExternalLink, FileText } from 'lucide-react';

interface ClipCardProps {
  clip: Clip;
}

export function ClipCard({ clip }: ClipCardProps) {
  return (
    <Link href={`/clips/${clip.id}`}>
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                {clip.content_type === 'url' ? (
                  <ExternalLink className="h-4 w-4" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                <span>
                  {clip.source_author && `${clip.source_author}`}
                  {clip.source_publication &&
                    ` • ${clip.source_publication}`}
                  {!clip.source_author &&
                    !clip.source_publication &&
                    'Pasted Text'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDate(clip.created_at)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-3 line-clamp-3">
            {truncateText(clip.content, 150)}
          </p>
          {clip.user_notes && (
            <p className="text-sm text-muted-foreground italic mb-3">
              What I like: {truncateText(clip.user_notes, 100)}
            </p>
          )}
          {clip.tags && clip.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {clip.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
