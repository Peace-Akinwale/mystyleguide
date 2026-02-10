'use client';

import { useEffect, useState } from 'react';
import { Clip, Feedback, AnalyzeResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, BookOpen, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type FocusArea = {
  id: string;
  label: string;
};

const focusAreas: FocusArea[] = [
  { id: 'sentence_structure', label: 'Sentence Structure' },
  { id: 'rhetorical_devices', label: 'Rhetorical Devices' },
  { id: 'tone_voice', label: 'Tone & Voice' },
  { id: 'word_choice', label: 'Word Choice' },
  { id: 'metaphors', label: 'Metaphors & Analogies' },
  { id: 'rhythm_pacing', label: 'Rhythm & Pacing' },
];

export default function AnalyzePage() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [selectedClipIds, setSelectedClipIds] = useState<string[]>([]);
  const [selectedFeedbackIds, setSelectedFeedbackIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<(AnalyzeResponse & { claudeResponse: string }) | null>(null);
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clipsRes, feedbackRes] = await Promise.all([
          fetch('/api/clips'),
          fetch('/api/feedback'),
        ]);

        if (clipsRes.ok) {
          const clipsData = await clipsRes.json();
          setClips(clipsData || []);
        }

        if (feedbackRes.ok) {
          const feedbackData = await feedbackRes.json();
          setFeedbackList(feedbackData || []);
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

  const handleFocusAreaToggle = (areaId: string) => {
    setSelectedFocusAreas((prev) =>
      prev.includes(areaId)
        ? prev.filter((id) => id !== areaId)
        : [...prev, areaId]
    );
  };

  const handleClipToggle = (clipId: string) => {
    setSelectedClipIds((prev) =>
      prev.includes(clipId) ? prev.filter((id) => id !== clipId) : [...prev, clipId]
    );
  };

  const handleFeedbackToggle = (feedbackId: string) => {
    setSelectedFeedbackIds((prev) =>
      prev.includes(feedbackId) ? prev.filter((id) => id !== feedbackId) : [...prev, feedbackId]
    );
  };

  const handleAnalyzeEverything = async () => {
    if (clips.length === 0 && feedbackList.length === 0) {
      toast({
        title: 'Nothing to analyze',
        description: 'Add some clips or feedback first',
        variant: 'destructive',
      });
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clipIds: clips.map((c) => c.id),
          feedbackIds: feedbackList.map((f) => f.id),
          focusAreas: selectedFocusAreas,
          includeFeedback: true,
        }),
      });

      if (!response.ok) {
        let message = 'Failed to analyze';
        try {
          const errorBody = await response.json();
          if (errorBody?.error) message = String(errorBody.error);
        } catch {}
        throw new Error(message);
      }

      const data = await response.json();
      setResult(data);

      toast({
        title: 'Analysis Complete',
        description: 'Your writing has been analyzed successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to analyze',
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnalyzeSelected = async () => {
    if (selectedClipIds.length === 0 && selectedFeedbackIds.length === 0) {
      toast({
        title: 'Nothing selected',
        description: 'Select at least one clip or feedback item',
        variant: 'destructive',
      });
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clipIds: selectedClipIds,
          feedbackIds: selectedFeedbackIds,
          focusAreas: selectedFocusAreas,
          includeFeedback: selectedFeedbackIds.length > 0,
        }),
      });

      if (!response.ok) {
        let message = 'Failed to analyze';
        try {
          const errorBody = await response.json();
          if (errorBody?.error) message = String(errorBody.error);
        } catch {}
        throw new Error(message);
      }

      const data = await response.json();
      setResult(data);

      toast({
        title: 'Analysis Complete',
        description: 'Your selection has been analyzed successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to analyze',
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateStyleGuide = async () => {
    const clipsToUse = result ? (selectedClipIds.length > 0 ? selectedClipIds : clips.map(c => c.id)) : clips.map(c => c.id);
    const feedbackToUse = result ? (selectedFeedbackIds.length > 0 ? selectedFeedbackIds : feedbackList.map(f => f.id)) : feedbackList.map(f => f.id);

    setGenerating(true);
    try {
      const response = await fetch('/api/style-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clipIds: clipsToUse,
          feedbackIds: feedbackToUse,
          title: 'My Writing Style Guide',
          includeFeedback: feedbackToUse.length > 0,
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
        description: error instanceof Error ? error.message : 'Failed to generate style guide',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const downloadMarkdown = () => {
    if (!result) return;

    const markdown = result.claudeResponse;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `writing-analysis-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalItems = clips.length + feedbackList.length;
  const selectedTotal = selectedClipIds.length + selectedFeedbackIds.length;

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
        ) : totalItems === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No clips or feedback to analyze yet. Add some first.
            </p>
          </div>
        ) : !result ? (
          <div className="space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>What You Have</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-6 bg-muted/50 rounded-lg border">
                    <p className="text-3xl font-bold text-foreground mb-1">{clips.length}</p>
                    <p className="text-sm text-muted-foreground">Clips (Do This)</p>
                  </div>
                  <div className="p-6 bg-muted/50 rounded-lg border">
                    <p className="text-3xl font-bold text-foreground mb-1">{feedbackList.length}</p>
                    <p className="text-sm text-muted-foreground">Feedback (Don&apos;t Do)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Focus Areas */}
            <Card>
              <CardHeader>
                <CardTitle>Focus Areas (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {focusAreas.map((area) => (
                    <div key={area.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <Checkbox
                        id={area.id}
                        checked={selectedFocusAreas.includes(area.id)}
                        onCheckedChange={() => handleFocusAreaToggle(area.id)}
                      />
                      <Label htmlFor={area.id} className="text-sm font-normal cursor-pointer flex-1">
                        {area.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleAnalyzeEverything}
                  disabled={analyzing || totalItems === 0}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  {analyzing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Analyze Everything ({totalItems} items)
                </Button>

                <Button
                  onClick={handleAnalyzeSelected}
                  disabled={analyzing || selectedTotal === 0}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  {analyzing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Analyze Selected ({selectedTotal})
                </Button>
              </CardContent>
            </Card>

            {/* Select Clips */}
            {clips.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Clips to Analyze</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {clips.map((clip) => (
                      <div
                        key={clip.id}
                        className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          id={clip.id}
                          checked={selectedClipIds.includes(clip.id)}
                          onCheckedChange={() => handleClipToggle(clip.id)}
                        />
                        <Label htmlFor={clip.id} className="flex-1 cursor-pointer space-y-1">
                          <p className="text-sm font-medium">
                            {clip.source_author || 'Untitled'}
                            {clip.source_publication && ` • ${clip.source_publication}`}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {clip.content.substring(0, 100)}...
                          </p>
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Select Feedback */}
            {feedbackList.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Feedback to Analyze</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {feedbackList.map((fb) => (
                      <div
                        key={fb.id}
                        className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          id={fb.id}
                          checked={selectedFeedbackIds.includes(fb.id)}
                          onCheckedChange={() => handleFeedbackToggle(fb.id)}
                        />
                        <Label htmlFor={fb.id} className="flex-1 cursor-pointer space-y-1">
                          <p className="text-sm font-medium">Editor Feedback</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            My text: {fb.my_text.substring(0, 60)}...
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-400 line-clamp-1">
                            Feedback: {fb.editor_feedback.substring(0, 60)}...
                          </p>
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* Analysis Results */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <CardTitle>Your Writing Style Analysis</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadMarkdown}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download MD
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:leading-relaxed prose-li:leading-relaxed">
                  <ReactMarkdown>{result.claudeResponse}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            {/* Generate Style Guide */}
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle>Ready to Create Your Style Guide?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate a comprehensive style guide with both &quot;Do This&quot; and &quot;Don&apos;t Do This&quot; sections based on this analysis.
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

            {/* Analyze Again */}
            <Button variant="outline" onClick={() => setResult(null)} className="w-full">
              Analyze Again
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
