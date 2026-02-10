'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clip } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  ExternalLink,
  Trash2,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface ClipDetailProps {
  clip: Clip;
}

export function ClipDetail({ clip }: ClipDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this clip?')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/clips/${clip.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete clip');
      }

      toast({
        title: 'Success',
        description: 'Clip deleted successfully',
      });

      router.push('/clips');
    } catch (error) {
      console.error('Failed to delete clip:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete clip',
        variant: 'destructive',
      });
      setDeleting(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clipIds: [clip.id],
          focusAreas: [],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze clip');
      }

      const data = await response.json();

      toast({
        title: 'Analysis Complete',
        description: 'Clip has been analyzed successfully',
      });

      // You could store the analysis result in state and display it
      console.log('Analysis result:', data);
    } catch (error) {
      console.error('Failed to analyze clip:', error);
      toast({
        title: 'Error',
        description: 'Failed to analyze clip',
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4 px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </header>

      <main className="container px-4 py-6 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">
                  {clip.source_author && `By ${clip.source_author}`}
                  {!clip.source_author && 'Writing Sample'}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  {clip.source_publication && (
                    <span>{clip.source_publication}</span>
                  )}
                  {clip.source_url && (
                    <a
                      href={clip.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-foreground"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View original
                    </a>
                  )}
                  <span>•</span>
                  <span>{formatDate(clip.created_at)}</span>
                </div>
              </div>
            </div>

            {clip.tags && clip.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {clip.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Content</h3>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{clip.content}</p>
              </div>
            </div>

            {clip.user_notes && (
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-2">What I Like About This</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {clip.user_notes}
                </p>
              </div>
            )}

            <div className="flex gap-2 border-t pt-6">
              <Button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="flex-1"
              >
                {analyzing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Analyze This Clip
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
