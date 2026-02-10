import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { FetchUrlResponse } from '@/types';

export async function fetchAndParseUrl(url: string): Promise<FetchUrlResponse> {
  try {
    // Fetch the HTML content
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const html = await response.text();

    // Parse with JSDOM
    const dom = new JSDOM(html, { url });
    const document = dom.window.document;

    // Extract metadata before Readability processes it
    const metadata = extractMetadata(document);

    // Use Readability to extract main content
    const reader = new Readability(document);
    const article = reader.parse();

    if (!article) {
      throw new Error('Failed to parse article content');
    }

    const content = article.textContent?.trim();
    if (!content) {
      throw new Error('Failed to extract article text');
    }

    return {
      content,
      title: article.title || metadata.title || 'Untitled',
      author: article.byline || metadata.author,
      publication: metadata.publication,
      excerpt: article.excerpt || undefined,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`URL parsing failed: ${error.message}`);
    }
    throw new Error('URL parsing failed: Unknown error');
  }
}

function extractMetadata(document: Document) {
  const metadata: {
    title?: string;
    author?: string;
    publication?: string;
  } = {};

  // Try to extract title from meta tags
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  metadata.title =
    ogTitle?.getAttribute('content') ||
    twitterTitle?.getAttribute('content') ||
    document.title;

  // Try to extract author
  const authorMeta = document.querySelector('meta[name="author"]');
  const ogAuthor = document.querySelector('meta[property="article:author"]');
  const twitterCreator = document.querySelector('meta[name="twitter:creator"]');
  metadata.author =
    authorMeta?.getAttribute('content') ||
    ogAuthor?.getAttribute('content') ||
    twitterCreator?.getAttribute('content') ||
    undefined;

  // Try to extract publication/site name
  const ogSiteName = document.querySelector('meta[property="og:site_name"]');
  const publisher = document.querySelector('meta[property="article:publisher"]');
  metadata.publication =
    ogSiteName?.getAttribute('content') ||
    publisher?.getAttribute('content') ||
    undefined;

  return metadata;
}

export function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
