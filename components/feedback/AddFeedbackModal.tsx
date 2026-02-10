'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface AddFeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFeedbackAdded: () => void;
}

export function AddFeedbackModal({
  open,
  onOpenChange,
  onFeedbackAdded,
}: AddFeedbackModalProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [myText, setMyText] = useState('');
  const [editorFeedback, setEditorFeedback] = useState('');
  const [context, setContext] = useState('');
  const [tags, setTags] = useState('');

  const resetForm = () => {
    setMyText('');
    setEditorFeedback('');
    setContext('');
    setTags('');
  };

  const handleSave = async () => {
    if (!myText || !editorFeedback) {
      toast({
        title: 'Error',
        description: 'Both your text and the editor feedback are required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          my_text: myText,
          editor_feedback: editorFeedback,
          context: context || null,
          tags: tags ? tags.split(',').map((t) => t.trim()) : [],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save feedback');
      }

      toast({
        title: 'Success',
        description: 'Feedback saved successfully',
      });

      resetForm();
      onOpenChange(false);
      onFeedbackAdded();
    } catch (error) {
      console.error('Failed to save feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to save feedback',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Editor Feedback</DialogTitle>
          <DialogDescription>
            Save your text and the editor&apos;s correction to learn from mistakes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="my-text">Your Original Text *</Label>
            <Textarea
              id="my-text"
              placeholder="Paste the text you wrote that received feedback..."
              rows={4}
              value={myText}
              onChange={(e) => setMyText(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="editor-feedback">Editor&apos;s Feedback/Correction *</Label>
            <Textarea
              id="editor-feedback"
              placeholder="What did the editor say? What was the correction or suggestion?"
              rows={4}
              value={editorFeedback}
              onChange={(e) => setEditorFeedback(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">Context (optional)</Label>
            <Input
              id="context"
              placeholder="e.g. Blog post, Email, Technical doc..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              placeholder="e.g. grammar, word choice, clarity"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <Button onClick={handleSave} disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Feedback
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
