import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase-server';
import { analyzeCombined } from '@/lib/anthropic';
import { getErrorMessage, pickErrorDetails } from '@/lib/error-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clipIds, feedbackIds, focusAreas, includeFeedback } = body;

    // Fetch clips - if no specific IDs provided, fetch all
    let clips = [];
    if (clipIds && clipIds.length > 0) {
      clips = await Promise.all(clipIds.map((id: string) => db.getClip(id)));
    } else {
      // Fetch all clips if none specified
      const allClips = await db.getClips();
      clips = allClips || [];
    }

    // Fetch feedback - if no specific IDs provided, fetch all
    let feedback = [];
    if (includeFeedback) {
      if (feedbackIds && feedbackIds.length > 0) {
        feedback = await Promise.all(feedbackIds.map((id: string) => db.getFeedbackItem(id)));
      } else {
        // Fetch all feedback if none specified
        const allFeedback = await db.getFeedback();
        feedback = allFeedback || [];
      }
    }

    if (clips.length === 0 && feedback.length === 0) {
      return NextResponse.json(
        { error: 'No clips or feedback found. Add some first.' },
        { status: 400 }
      );
    }

    // Combined analysis
    const result = await analyzeCombined(clips, feedback, focusAreas || []);

    // Store analysis if we have at least one clip
    if (clips.length > 0) {
      await db.createAnalysis({
        clip_id: clips[0].id,
        analysis_type: 'batch',
        patterns: result.patterns,
        style_elements: result.styleElements,
        claude_response: result.claudeResponse,
      });
    }

    return NextResponse.json({
      patterns: result.patterns,
      styleElements: result.styleElements,
      claudeResponse: result.claudeResponse,
    });
  } catch (error) {
    console.error('Error analyzing:', error);
    const errorMessage = getErrorMessage(error);
    return NextResponse.json(
      { error: errorMessage, details: pickErrorDetails(error) },
      { status: 500 }
    );
  }
}
