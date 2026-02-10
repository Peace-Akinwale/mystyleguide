'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ClipDetail } from '@/components/clips/ClipDetail';
import { Clip } from '@/types';
import { Loader2 } from 'lucide-react';

export default function ClipPage() {
  const params = useParams();
  const [clip, setClip] = useState<Clip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClip = async () => {
      try {
        const response = await fetch(`/api/clips/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setClip(data);
        }
      } catch (error) {
        console.error('Failed to fetch clip:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchClip();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!clip) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Clip not found</p>
      </div>
    );
  }

  return <ClipDetail clip={clip} />;
}
