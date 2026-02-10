import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase-server';
import { generateStyleGuide } from '@/lib/anthropic';
import { getErrorMessage, pickErrorDetails } from '@/lib/error-utils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const all = searchParams.get('all') === 'true';

    if (all) {
      const styleGuides = await db.getAllStyleGuides();
      return NextResponse.json(styleGuides);
    }

    const styleGuide = await db.getActiveStyleGuide();
    return NextResponse.json(styleGuide);
  } catch (error) {
    console.error('Error fetching style guide:', error);
    return NextResponse.json(
      { error: getErrorMessage(error), details: pickErrorDetails(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clipIds, feedbackIds, title, includeFeedback } = body;

    // Fetch clips
    const clips = clipIds && clipIds.length > 0
      ? await Promise.all(clipIds.map((id: string) => db.getClip(id)))
      : [];

    // Fetch feedback
    const feedback = includeFeedback && feedbackIds && feedbackIds.length > 0
      ? await Promise.all(feedbackIds.map((id: string) => db.getFeedbackItem(id)))
      : [];

    if (clips.length === 0 && feedback.length === 0) {
      return NextResponse.json(
        { error: 'At least one clip or feedback item is required' },
        { status: 400 }
      );
    }

    // Fetch analyses
    const analyses = await db.getAnalyses();

    // Generate style guide
    const content = await generateStyleGuide(clips, analyses, feedback);

    // Save style guide
    const styleGuide = await db.createStyleGuide({
      title: title || 'My Writing Style Guide',
      content,
      based_on_clip_ids: clipIds || [],
      is_active: true,
    });

    return NextResponse.json(styleGuide, { status: 201 });
  } catch (error) {
    console.error('Error creating style guide:', error);
    const errorMessage = getErrorMessage(error);
    return NextResponse.json(
      { error: errorMessage, details: pickErrorDetails(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Style guide ID is required' },
        { status: 400 }
      );
    }

    const styleGuide = await db.updateStyleGuide(id, updates);
    return NextResponse.json(styleGuide);
  } catch (error) {
    console.error('Error updating style guide:', error);
    return NextResponse.json(
      { error: getErrorMessage(error), details: pickErrorDetails(error) },
      { status: 500 }
    );
  }
}
