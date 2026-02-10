'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Clip, FocusArea } from '@/types';
import { Loader2, Sparkles } from 'lucide-react';

interface AnalysisOptionsProps {
  clips: Clip[];
  onAnalyze: (clipIds: string[], focusAreas: string[]) => Promise<void>;
  analyzing: boolean;
}

const focusAreas: { id: FocusArea; label: string }[] = [
  { id: 'sentence_structure', label: 'Sentence Structure' },
  { id: 'rhetorical_devices', label: 'Rhetorical Devices' },
  { id: 'tone_voice', label: 'Tone & Voice' },
  { id: 'word_choice', label: 'Word Choice' },
  { id: 'metaphors', label: 'Metaphors & Analogies' },
  { id: 'rhythm_pacing', label: 'Rhythm & Pacing' },
];

export function AnalysisOptions({
  clips,
  onAnalyze,
  analyzing,
}: AnalysisOptionsProps) {
  const [selectedClips, setSelectedClips] = useState<string[]>([]);
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);

  const handleClipToggle = (clipId: string) => {
    setSelectedClips((prev) =>
      prev.includes(clipId)
        ? prev.filter((id) => id !== clipId)
        : [...prev, clipId]
    );
  };

  const handleFocusAreaToggle = (areaId: string) => {
    setSelectedFocusAreas((prev) =>
      prev.includes(areaId)
        ? prev.filter((id) => id !== areaId)
        : [...prev, areaId]
    );
  };

  const handleAnalyzeAll = () => {
    const allClipIds = clips.map((c) => c.id);
    onAnalyze(allClipIds, selectedFocusAreas);
  };

  const handleAnalyzeSelected = () => {
    if (selectedClips.length === 0) {
      return;
    }
    onAnalyze(selectedClips, selectedFocusAreas);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Analysis Focus Areas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {focusAreas.map((area) => (
              <div key={area.id} className="flex items-center space-x-2">
                <Checkbox
                  id={area.id}
                  checked={selectedFocusAreas.includes(area.id)}
                  onCheckedChange={() => handleFocusAreaToggle(area.id)}
                />
                <Label
                  htmlFor={area.id}
                  className="text-sm font-normal cursor-pointer"
                >
                  {area.label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={handleAnalyzeAll}
            disabled={analyzing || clips.length === 0}
            className="w-full"
            size="lg"
          >
            {analyzing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Analyze All Clips ({clips.length})
          </Button>

          <Button
            onClick={handleAnalyzeSelected}
            disabled={analyzing || selectedClips.length === 0}
            variant="secondary"
            className="w-full"
            size="lg"
          >
            {analyzing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Analyze Selected ({selectedClips.length})
          </Button>
        </CardContent>
      </Card>

      {clips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Clips to Analyze</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clips.map((clip) => (
                <div
                  key={clip.id}
                  className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <Checkbox
                    id={clip.id}
                    checked={selectedClips.includes(clip.id)}
                    onCheckedChange={() => handleClipToggle(clip.id)}
                  />
                  <Label
                    htmlFor={clip.id}
                    className="flex-1 cursor-pointer space-y-1"
                  >
                    <p className="text-sm font-medium">
                      {clip.source_author || 'Untitled'}
                      {clip.source_publication &&
                        ` • ${clip.source_publication}`}
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
    </div>
  );
}
