'use client';

import { useEffect, useState } from 'react';
import { Clip, Feedback } from '@/types';
import { AnalyzeChat } from '@/components/analyze/AnalyzeChat';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function AnalyzePage() {
  const [clipCount, setClipCount] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clipsRes, feedbackRes] = await Promise.all([
          fetch('/api/clips'),
          fetch('/api/feedback'),
        ]);

        if (clipsRes.ok) {
          const clipsData = await clipsRes.json();
          setClipCount(clipsData?.length || 0);
        }

        if (feedbackRes.ok) {
          const feedbackData = await feedbackRes.json();
          setFeedbackCount(feedbackData?.length || 0);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [toast]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4">
          <h1 className="text-h2">Analyze Your Writing</h1>
        </div>
      </header>

      <main className="container px-4 py-6 max-w-4xl">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <AnalyzeChat clipCount={clipCount} feedbackCount={feedbackCount} />
        )}
      </main>
    </div>
  );
}
