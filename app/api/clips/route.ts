import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase-server';
import { getErrorMessage, pickErrorDetails } from '@/lib/error-utils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const contentType = searchParams.get('contentType') || undefined;
    const tagsParam = searchParams.get('tags');
    const tags = tagsParam ? tagsParam.split(',') : undefined;

    const clips = await db.getClips({ contentType, tags });
    return NextResponse.json(clips);
  } catch (error) {
    console.error('Error fetching clips:', error);
    return NextResponse.json(
      { error: getErrorMessage(error), details: pickErrorDetails(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.content || !body.content_type) {
      return NextResponse.json(
        { error: 'Content and content_type are required' },
        { status: 400 }
      );
    }

    const clip = await db.createClip({
      content_type: body.content_type,
      content: body.content,
      source_url: body.source_url,
      source_author: body.source_author,
      source_publication: body.source_publication,
      user_notes: body.user_notes || '',
      tags: body.tags || [],
      raw_html: body.raw_html,
    });

    return NextResponse.json(clip, { status: 201 });
  } catch (error) {
    console.error('Error creating clip:', error);
    return NextResponse.json(
      { error: getErrorMessage(error), details: pickErrorDetails(error) },
      { status: 500 }
    );
  }
}
