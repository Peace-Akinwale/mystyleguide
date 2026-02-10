import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { Analysis, Clip, Feedback } from '@/types';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

const anthropic = new Anthropic({
  apiKey: requireEnv('ANTHROPIC_API_KEY'),
});

const ANTHROPIC_MODEL =
  resolveAnthropicModel(process.env.ANTHROPIC_MODEL);

function resolveAnthropicModel(value: string | undefined): string {
  const v = value?.trim();
  if (!v) return 'claude-3-5-sonnet-latest';

  // Allow a friendlier alias in env/config.
  if (v === 'claude-3-5-sonnet') return 'claude-3-5-sonnet-latest';

  return v;
}

export async function analyzeClip(clip: Clip, focusAreas: string[]) {
  const focusAreasText = focusAreas.length > 0
    ? `Focus especially on: ${focusAreas.join(', ')}`
    : '';

  const prompt = `You are a writing style analyst. Analyze the following writing sample and identify key patterns, techniques, and characteristics.

Writing Sample:
"""
${clip.content}
"""

User Notes: "${clip.user_notes}"

${focusAreasText}

Please analyze this writing and identify:
1. Sentence structure patterns (simple, complex, compound, length variations)
2. Rhetorical devices used (metaphors, analogies, repetition, etc.)
3. Tone and voice characteristics
4. Word choice patterns (formal/informal, technical/accessible, etc.)
5. Any distinctive rhythmic or pacing elements
6. Overall writing style signature

Format your response as a structured analysis with clear sections and specific examples from the text.`;

  const message = await anthropic.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  return {
    claudeResponse: content.text,
    patterns: extractPatterns(content.text),
    styleElements: extractStyleElements(content.text),
  };
}

export async function analyzeClips(clips: Clip[], focusAreas: string[]) {
  const focusAreasText = focusAreas.length > 0
    ? `Focus especially on: ${focusAreas.join(', ')}`
    : '';

  const clipsText = clips
    .map(
      (clip, i) => `
=== SAMPLE ${i + 1} ===
Content: ${clip.content}
User notes: ${clip.user_notes}
`
    )
    .join('\n');

  const prompt = `You are a writing style analyst. Analyze the following collection of writing samples to identify consistent patterns and create a comprehensive style profile.

${clipsText}

${focusAreasText}

Please analyze these samples and identify:
1. Common sentence structure patterns across all samples
2. Recurring rhetorical devices and techniques
3. Consistent tone and voice characteristics
4. Vocabulary and word choice patterns
5. Metaphor usage and types
6. Rhythmic and pacing tendencies

Provide a synthesis that highlights what makes this writing distinctive and recognizable. Include specific examples from the samples.`;

  const message = await anthropic.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  return {
    claudeResponse: content.text,
    patterns: extractPatterns(content.text),
    styleElements: extractStyleElements(content.text),
  };
}

export async function analyzeCombined(
  clips: Clip[],
  feedback: Feedback[],
  focusAreas: string[]
) {
  const focusAreasText = focusAreas.length > 0
    ? `Focus especially on: ${focusAreas.join(', ')}`
    : '';

  const clipsText = clips.length > 0
    ? clips.map((clip, i) => `
=== GOOD EXAMPLE ${i + 1} (Writing to emulate) ===
Content: ${clip.content}
What the user likes about it: ${clip.user_notes}
`).join('\n')
    : '';

  const feedbackText = feedback.length > 0
    ? feedback.map((fb, i) => `
=== MISTAKE ${i + 1} (Writing to avoid) ===
User's original text: ${fb.my_text}
Editor's feedback/correction: ${fb.editor_feedback}
${fb.context ? `Context: ${fb.context}` : ''}
`).join('\n')
    : '';

  const prompt = `You are a writing style analyst. Analyze the following to create a comprehensive style profile.

${clips.length > 0 ? `## GOOD EXAMPLES (Writing the user admires - learn what TO DO)
${clipsText}` : ''}

${feedback.length > 0 ? `## MISTAKES & CORRECTIONS (Editor feedback on user's writing - learn what NOT TO DO)
${feedbackText}` : ''}

${focusAreasText}

Please analyze and provide:

1. **Patterns to Emulate** (from good examples):
   - Sentence structures that work
   - Effective rhetorical devices
   - Tone and voice characteristics
   - Strong word choices

2. **Patterns to Avoid** (from editor feedback):
   - Common mistakes identified
   - Bad habits to break
   - Word choices to avoid
   - Structural issues to fix

3. **Synthesis**: What makes good writing in this context, and what pitfalls to watch for.

Be specific with examples from both the good samples and the mistakes.`;

  const message = await anthropic.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 8192,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  return {
    claudeResponse: content.text,
    patterns: extractPatterns(content.text),
    styleElements: extractStyleElements(content.text),
  };
}

export async function generateStyleGuide(
  clips: Clip[],
  analyses: Analysis[],
  feedback: Feedback[] = []
) {
  const analysesText = analyses
    .map((a) => `\n=== Analysis ===\n${a.claude_response}`)
    .join('\n');

  const clipsContext = clips
    .map((c) => `\n- "${c.content.substring(0, 200)}..." (User likes: ${c.user_notes})`)
    .join('\n');

  const feedbackContext = feedback.length > 0
    ? feedback.map((fb) => `
- My text: "${fb.my_text.substring(0, 150)}..."
  Editor said: "${fb.editor_feedback}"`).join('\n')
    : '';

  const prompt = `Based on the following writing analyses, samples, and editor feedback, create a comprehensive personal style guide.

${analysesText ? `## Previous Analyses:
${analysesText}` : ''}

${clipsContext ? `## Good Writing Samples (to emulate):
${clipsContext}` : ''}

${feedbackContext ? `## Editor Feedback on My Writing (mistakes to avoid):
${feedbackContext}` : ''}

Create a style guide in markdown format with these sections:

# My Writing Style Guide

## Do This (Patterns to Follow)
[Specific techniques and patterns from the good examples, with concrete examples]

## Don't Do This (Mistakes to Avoid)
[Common errors based on editor feedback, with examples of what NOT to write and why]

## Sentence Patterns
[Key sentence structures that work well]

## Tone & Voice
[Voice and tone characteristics to maintain]

## Word Choice Guidelines
[Preferred vocabulary, words to use and words to avoid]

## Rhetorical Devices
[Effective devices with examples]

## Quick Reference Checklist
[Bullet point summary for quick editing passes]

Make it actionable and specific. Include concrete examples of both good and bad writing. This should help the writer self-edit and maintain consistency.`;

  const message = await anthropic.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 8192,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  return content.text;
}

// Helper functions to extract structured data from Claude's response
function extractPatterns(text: string): Record<string, unknown> {
  // Simple extraction - looks for patterns in the response
  const patterns: Record<string, unknown> = {};

  // Extract sentence structure patterns
  const sentenceMatch = text.match(/sentence structure[s]?:?\s*([^\n]+)/i);
  if (sentenceMatch) {
    patterns.sentenceStructure = sentenceMatch[1];
  }

  // Extract rhetorical devices
  const rhetoricalMatch = text.match(/rhetorical device[s]?:?\s*([^\n]+)/i);
  if (rhetoricalMatch) {
    patterns.rhetoricalDevices = rhetoricalMatch[1];
  }

  return patterns;
}

function extractStyleElements(text: string): Record<string, unknown> {
  const elements: Record<string, unknown> = {};

  // Extract tone
  const toneMatch = text.match(/tone[:\s]+([^\n.]+)/i);
  if (toneMatch) {
    elements.tone = toneMatch[1];
  }

  // Extract voice characteristics
  const voiceMatch = text.match(/voice[:\s]+([^\n.]+)/i);
  if (voiceMatch) {
    elements.voice = voiceMatch[1];
  }

  return elements;
}
