'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ClipCard } from '@/components/clips/ClipCard';
import { AddClipModal } from '@/components/clips/AddClipModal';
import { Clip } from '@/types';
import { Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ClipsPage() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchClips = useCallback(async () => {
    try {
      const response = await fetch('/api/clips');
      if (response.ok) {
        const data = await response.json();
        setClips(data);
      } else {
        let message = 'Failed to load clips';
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
      console.error('Failed to fetch clips:', error);
      toast({
        title: 'Error',
        description: 'Failed to load clips',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void fetchClips();
  }, [fetchClips]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <h1 className="text-h2">mystyleguide</h1>
          <Button
            onClick={() => setAddModalOpen(true)}
            className="shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Clip
          </Button>
        </div>
      </header>

      <main className="container px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : clips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-6">
              No clips yet. Add your first writing sample to get started.
            </p>
            <Button
              onClick={() => setAddModalOpen(true)}
              size="lg"
              className="shadow-md"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Clip
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clips.map((clip) => (
              <ClipCard key={clip.id} clip={clip} />
            ))}
          </div>
        )}
      </main>

      <AddClipModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onClipAdded={fetchClips}
      />
    </div>
  );
}
