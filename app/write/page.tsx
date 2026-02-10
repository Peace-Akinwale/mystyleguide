'use client';

import { useEffect, useState } from 'react';
import { StyleGuide } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { downloadTextFile, copyToClipboard } from '@/lib/utils';
import { Download, Copy, ChevronRight, ChevronLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

export default function WritePage() {
  const [content, setContent] = useState('');
  const [styleGuide, setStyleGuide] = useState<StyleGuide | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStyleGuide = async () => {
      try {
        const response = await fetch('/api/style-guide');
        if (response.ok) {
          const data = await response.json();
          setStyleGuide(data);
        } else {
          let message = 'Failed to load style guide';
          try {
            const body = await response.json();
            if (body?.error) message = String(body.error);
          } catch {}
          toast({
            title: 'Error',
            description: message,
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Failed to fetch style guide:', error);
        toast({
          title: 'Error',
          description: 'Failed to load style guide',
          variant: 'destructive',
        });
      }
    };

    void fetchStyleGuide();
  }, [toast]);

  const handleDownload = () => {
    if (!content) return;
    downloadTextFile(content, 'my-writing.txt');
    toast({
      title: 'Downloaded',
      description: 'Writing saved to file',
    });
  };

  const handleCopy = async () => {
    if (!content) return;
    try {
      await copyToClipboard(content);
      toast({
        title: 'Copied',
        description: 'Writing copied to clipboard',
      });
    } catch (error) {
      console.error('Failed to copy writing:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold">Write</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} disabled={!content}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload} disabled={!content}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            {styleGuide && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGuide(!showGuide)}
              >
                {showGuide ? (
                  <ChevronRight className="h-4 w-4 mr-2" />
                ) : (
                  <ChevronLeft className="h-4 w-4 mr-2" />
                )}
                {showGuide ? 'Hide' : 'Show'} Guide
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className={showGuide ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <Card className="h-[calc(100vh-12rem)]">
              <CardHeader>
                <CardTitle>Your Writing</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start writing here..."
                  className="min-h-[calc(100vh-18rem)] resize-none font-mono"
                />
              </CardContent>
            </Card>
          </div>

          {showGuide && styleGuide && (
            <div className="lg:col-span-1">
              <Card className="h-[calc(100vh-12rem)] overflow-y-auto">
                <CardHeader>
                  <CardTitle className="text-lg">Style Reference</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{styleGuide.content}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
