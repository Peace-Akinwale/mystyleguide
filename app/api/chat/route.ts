import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, styleGuideContent } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'messages array is required' },
        { status: 400 }
      );
    }

    // System message that includes the style guide as context
    const systemMessage = styleGuideContent
      ? `You are a writing coach helping the user refine their personal writing style guide.

Current Style Guide:
${styleGuideContent}

The user can ask you to:
- Explain sections in more detail
- Add more examples
- Remove or modify parts
- Expand on specific techniques
- Generate alternative versions of sections

When they ask for changes, provide the updated content clearly marked. Be specific and actionable.`
      : 'You are a helpful writing coach.';

    const message = await anthropic.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 4096,
      system: systemMessage,
      messages: messages.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    return NextResponse.json({
      message: content.text,
    });
  } catch (error) {
    console.error('Error in chat:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
