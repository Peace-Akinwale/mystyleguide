import { NextRequest, NextResponse } from 'next/server';
import { fetchAndParseUrl, isValidUrl } from '@/lib/url-parser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const result = await fetchAndParseUrl(url);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching URL:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch URL';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
