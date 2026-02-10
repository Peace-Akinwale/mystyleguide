import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase-server';

export async function GET() {
  try {
    const feedback = await db.getFeedback();
    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.my_text || !body.editor_feedback) {
      return NextResponse.json(
        { error: 'my_text and editor_feedback are required' },
        { status: 400 }
      );
    }

    const feedback = await db.createFeedback({
      my_text: body.my_text,
      editor_feedback: body.editor_feedback,
      context: body.context || null,
      tags: body.tags || [],
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error('Error creating feedback:', error);
    return NextResponse.json(
      { error: 'Failed to create feedback' },
      { status: 500 }
    );
  }
}
