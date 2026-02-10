'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalyzeResponse } from '@/types';
import { BookOpen, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AnalysisResultsProps {
  result: AnalyzeResponse & { claudeResponse: string };
  clipIds: string[];
}

export function AnalysisResults({ result, clipIds }: AnalysisResultsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);

  const handleGenerateStyleGuide = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/style-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clipIds,
          title: 'My Writing Style Guide',
        }),
      });

      if (!response.ok) {
        let message = 'Failed to generate style guide';
        try {
          const body = await response.json();
          if (body?.error) message = String(body.error);
        } catch {}
        throw new Error(message);
      }

      toast({
        title: 'Success',
        description: 'Style guide generated successfully',
      });

      router.push('/guide');
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to generate style guide',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Analysis Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap">{result.claudeResponse}</div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary">
        <CardHeader>
          <CardTitle>Ready to Create Your Style Guide?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Generate a comprehensive style guide based on this analysis and your
            collected clips.
          </p>
          <Button
            onClick={handleGenerateStyleGuide}
            disabled={generating}
            size="lg"
            className="w-full"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <BookOpen className="h-4 w-4 mr-2" />
            )}
            Generate Style Guide
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
