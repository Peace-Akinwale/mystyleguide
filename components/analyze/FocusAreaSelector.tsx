'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export interface FocusArea {
  id: string;
  label: string;
}

export const focusAreas: FocusArea[] = [
  { id: 'sentence_structure', label: 'Sentence Structure' },
  { id: 'rhetorical_devices', label: 'Rhetorical Devices' },
  { id: 'tone_voice', label: 'Tone & Voice' },
  { id: 'word_choice', label: 'Word Choice' },
  { id: 'metaphors', label: 'Metaphors & Analogies' },
  { id: 'rhythm_pacing', label: 'Rhythm & Pacing' },
];

interface FocusAreaSelectorProps {
  onSubmit: (selectedAreas: string[]) => void;
  onSkip: () => void;
}

export function FocusAreaSelector({ onSubmit, onSkip }: FocusAreaSelectorProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const handleToggle = (areaId: string) => {
    setSelected((prev) =>
      prev.includes(areaId)
        ? prev.filter((id) => id !== areaId)
        : [...prev, areaId]
    );
  };

  const handleSubmit = () => {
    onSubmit(selected);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium mb-3">
          Which areas should I focus on?
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          Select the aspects you want me to analyze. Leave unselected for a general analysis.
        </p>
      </div>

      {/* Focus Area Checkboxes */}
      <div className="grid grid-cols-1 gap-3">
        {focusAreas.map((area) => (
          <div
            key={area.id}
            className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
              selected.includes(area.id)
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-accent/50'
            }`}
          >
            <Checkbox
              id={`focus-${area.id}`}
              checked={selected.includes(area.id)}
              onCheckedChange={() => handleToggle(area.id)}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <Label
              htmlFor={`focus-${area.id}`}
              className="flex-1 text-sm font-normal cursor-pointer"
            >
              {area.label}
            </Label>
            {selected.includes(area.id) && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <Button
          onClick={handleSubmit}
          className="flex-1"
          disabled={selected.length === 0}
        >
          Start Analysis
          {selected.length > 0 && ` (${selected.length} selected)`}
        </Button>
        <Button onClick={onSkip} variant="outline">
          Skip
        </Button>
      </div>
    </div>
  );
}
