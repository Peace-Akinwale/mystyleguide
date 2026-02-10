'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FeedbackCard } from '@/components/feedback/FeedbackCard';
import { AddFeedbackModal } from '@/components/feedback/AddFeedbackModal';
import { Feedback } from '@/types';
import { Plus, Loader2, Trash2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';

export default function FeedbackPage() {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const fetchFeedback = useCallback(async () => {
    try {
      const response = await fetch('/api/feedback');
      if (response.ok) {
        const data = await response.json();
        setFeedbackList(data || []);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load feedback',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to load feedback',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void fetchFeedback();
  }, [fetchFeedback]);

  const handleDelete = async () => {
    if (!selectedFeedback) return;
    if (!confirm('Are you sure you want to delete this feedback?')) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/feedback/${selectedFeedback.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete feedback');
      }

      toast({
        title: 'Success',
        description: 'Feedback deleted successfully',
      });

      setSelectedFeedback(null);
      fetchFeedback();
    } catch (error) {
      console.error('Failed to delete feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete feedback',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {selectedFeedback && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedFeedback(null)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            <h1 className="text-h2">
              {selectedFeedback ? 'Feedback Details' : 'Editor Feedback'}
            </h1>
          </div>
          {!selectedFeedback && (
            <Button
              onClick={() => setAddModalOpen(true)}
              className="shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Feedback
            </Button>
          )}
          {selectedFeedback && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </Button>
          )}
        </div>
      </header>

      <main className="container px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !selectedFeedback ? (
          // List view
          feedbackList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-6">
                No feedback yet. Add editor corrections to learn from your mistakes.
              </p>
              <Button
                onClick={() => setAddModalOpen(true)}
                size="lg"
                className="shadow-md"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Feedback
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {feedbackList.map((fb) => (
                <FeedbackCard
                  key={fb.id}
                  feedback={fb}
                  onClick={() => setSelectedFeedback(fb)}
                />
              ))}
            </div>
          )
        ) : (
          // Detail view
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Feedback from {formatDate(selectedFeedback.created_at)}</CardTitle>
              {selectedFeedback.context && (
                <p className="text-sm text-muted-foreground">
                  Context: {selectedFeedback.context}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">My Original Text</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedFeedback.my_text}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-amber-700 dark:text-amber-400">
                  Editor&apos;s Feedback
                </h3>
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
                  <p className="whitespace-pre-wrap text-amber-900 dark:text-amber-100">
                    {selectedFeedback.editor_feedback}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <AddFeedbackModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onFeedbackAdded={fetchFeedback}
      />
    </div>
  );
}
