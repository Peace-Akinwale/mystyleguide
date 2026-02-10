import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase-server';
import { getErrorMessage, pickErrorDetails } from '@/lib/error-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clip = await db.getClip(id);
    return NextResponse.json(clip);
  } catch (error) {
    console.error('Error fetching clip:', error);
    return NextResponse.json(
      { error: getErrorMessage(error), details: pickErrorDetails(error) },
      { status: 404 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const clip = await db.updateClip(id, body);
    return NextResponse.json(clip);
  } catch (error) {
    console.error('Error updating clip:', error);
    return NextResponse.json(
      { error: getErrorMessage(error), details: pickErrorDetails(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.deleteClip(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting clip:', error);
    return NextResponse.json(
      { error: getErrorMessage(error), details: pickErrorDetails(error) },
      { status: 500 }
    );
  }
}
