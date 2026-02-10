'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface AddClipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClipAdded: () => void;
}

export function AddClipModal({
  open,
  onOpenChange,
  onClipAdded,
}: AddClipModalProps) {
  const [loading, setLoading] = useState(false);
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const { toast } = useToast();

  // Text clip state
  const [textContent, setTextContent] = useState('');
  const [textAuthor, setTextAuthor] = useState('');
  const [textPublication, setTextPublication] = useState('');
  const [textNotes, setTextNotes] = useState('');
  const [textTags, setTextTags] = useState('');

  // URL clip state
  const [url, setUrl] = useState('');
  const [urlContent, setUrlContent] = useState('');
  const [urlTitle, setUrlTitle] = useState('');
  const [urlAuthor, setUrlAuthor] = useState('');
  const [urlPublication, setUrlPublication] = useState('');
  const [urlNotes, setUrlNotes] = useState('');
  const [urlTags, setUrlTags] = useState('');
  const [urlFetched, setUrlFetched] = useState(false);

  const resetForm = () => {
    setTextContent('');
    setTextAuthor('');
    setTextPublication('');
    setTextNotes('');
    setTextTags('');
    setUrl('');
    setUrlContent('');
    setUrlTitle('');
    setUrlAuthor('');
    setUrlPublication('');
    setUrlNotes('');
    setUrlTags('');
    setUrlFetched(false);
  };

  const handleFetchUrl = async () => {
    if (!url) {
      toast({
        title: 'Error',
        description: 'Please enter a URL',
        variant: 'destructive',
      });
      return;
    }

    setFetchingUrl(true);
    try {
      const response = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch URL');
      }

      const data = await response.json();
      setUrlContent(data.content);
      setUrlTitle(data.title);
      setUrlAuthor(data.author || '');
      setUrlPublication(data.publication || '');
      setUrlFetched(true);

      toast({
        title: 'Success',
        description: 'Content fetched successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch URL',
        variant: 'destructive',
      });
    } finally {
      setFetchingUrl(false);
    }
  };

  const handleSaveText = async () => {
    if (!textContent || !textNotes) {
      toast({
        title: 'Error',
        description: 'Content and notes are required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/clips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_type: 'text',
          content: textContent,
          source_author: textAuthor || null,
          source_publication: textPublication || null,
          user_notes: textNotes,
          tags: textTags ? textTags.split(',').map((t) => t.trim()) : [],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save clip');
      }

      toast({
        title: 'Success',
        description: 'Clip saved successfully',
      });

      resetForm();
      onOpenChange(false);
      onClipAdded();
    } catch (error) {
      console.error('Failed to save text clip:', error);
      toast({
        title: 'Error',
        description: 'Failed to save clip',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUrl = async () => {
    if (!urlContent || !urlNotes) {
      toast({
        title: 'Error',
        description: 'Please fetch content and add notes',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/clips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_type: 'url',
          content: urlContent,
          source_url: url,
          source_author: urlAuthor || null,
          source_publication: urlPublication || null,
          user_notes: urlNotes,
          tags: urlTags ? urlTags.split(',').map((t) => t.trim()) : [],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save clip');
      }

      toast({
        title: 'Success',
        description: 'Clip saved successfully',
      });

      resetForm();
      onOpenChange(false);
      onClipAdded();
    } catch (error) {
      console.error('Failed to save URL clip:', error);
      toast({
        title: 'Error',
        description: 'Failed to save clip',
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
          <DialogTitle>Add New Clip</DialogTitle>
          <DialogDescription>
            Save a writing sample you admire
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">Paste Text</TabsTrigger>
            <TabsTrigger value="url">From URL</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="text-content">Content *</Label>
              <Textarea
                id="text-content"
                placeholder="Paste the writing sample here..."
                rows={8}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="text-author">Author</Label>
                <Input
                  id="text-author"
                  placeholder="Author name"
                  value={textAuthor}
                  onChange={(e) => setTextAuthor(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="text-publication">Publication</Label>
                <Input
                  id="text-publication"
                  placeholder="Publication name"
                  value={textPublication}
                  onChange={(e) => setTextPublication(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="text-notes">What do you like about this? *</Label>
              <Textarea
                id="text-notes"
                placeholder="Describe what makes this writing effective..."
                rows={3}
                value={textNotes}
                onChange={(e) => setTextNotes(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="text-tags">Tags (comma separated)</Label>
              <Input
                id="text-tags"
                placeholder="e.g. storytelling, technical, humorous"
                value={textTags}
                onChange={(e) => setTextTags(e.target.value)}
              />
            </div>

            <Button
              onClick={handleSaveText}
              disabled={loading}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Clip
            </Button>
          </TabsContent>

          <TabsContent value="url" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <div className="flex gap-2">
                <Input
                  id="url"
                  type="url"
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <Button
                  onClick={handleFetchUrl}
                  disabled={fetchingUrl}
                  variant="secondary"
                >
                  {fetchingUrl && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Fetch
                </Button>
              </div>
            </div>

            {urlFetched && (
              <>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <p className="text-sm font-medium">{urlTitle}</p>
                </div>

                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="p-3 bg-muted rounded-md max-h-40 overflow-y-auto">
                    <p className="text-sm">{urlContent.substring(0, 300)}...</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="url-author">Author</Label>
                    <Input
                      id="url-author"
                      value={urlAuthor}
                      onChange={(e) => setUrlAuthor(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="url-publication">Publication</Label>
                    <Input
                      id="url-publication"
                      value={urlPublication}
                      onChange={(e) => setUrlPublication(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url-notes">
                    What do you like about this? *
                  </Label>
                  <Textarea
                    id="url-notes"
                    placeholder="Describe what makes this writing effective..."
                    rows={3}
                    value={urlNotes}
                    onChange={(e) => setUrlNotes(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url-tags">Tags (comma separated)</Label>
                  <Input
                    id="url-tags"
                    placeholder="e.g. storytelling, technical, humorous"
                    value={urlTags}
                    onChange={(e) => setUrlTags(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleSaveUrl}
                  disabled={loading}
                  className="w-full"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Clip
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
