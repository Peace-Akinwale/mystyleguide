# mystyleguide

A standalone web app for collecting writing clips, analyzing them with Claude API, and generating personal style guides.

## Features

- **Clip Management**: Save writing samples from text or URLs
- **AI Analysis**: Analyze your clips with Claude to identify patterns
- **Style Guide Generation**: Create a comprehensive personal writing style guide
- **Writing Interface**: Write with your style guide as reference
- **Export Options**: Download style guides and clips

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: TailwindCSS + shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **AI**: Anthropic SDK (Claude API)
- **URL Parsing**: @mozilla/readability + jsdom
- **Deployment**: Vercel

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- An Anthropic API key

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Run the SQL to create tables
5. Get your project URL and anon key from Settings > API

### 3. Environment Variables

1. Update `.env.local` with your values:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_optional
ANTHROPIC_API_KEY=your_anthropic_api_key
ANTHROPIC_MODEL=claude-3-5-sonnet-latest
```

Notes:
- `SUPABASE_SERVICE_ROLE_KEY` is optional, but recommended if you keep RLS enabled and want API routes to work without user sessions during early development.
- If you hit `model not found` errors from Anthropic, set `ANTHROPIC_MODEL=claude-3-5-sonnet-latest` (alias supported: `claude-3-5-sonnet`).

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Usage

### Adding Clips

1. Click "Add Clip" button
2. Choose "Paste Text" or "From URL"
3. For URLs, click "Fetch" to extract content
4. Add notes about what you like
5. Optionally add tags
6. Save

### Analyzing Clips

1. Go to the "Analyze" tab
2. Select clips or analyze all
3. Choose focus areas (optional)
4. Click "Analyze"
5. View results

### Generating Style Guide

1. After analyzing clips, click "Generate Style Guide"
2. View in the "Guide" tab
3. Export as markdown or copy for Claude Projects

### Writing

1. Go to "Write" tab
2. Toggle style guide reference panel
3. Write with your style guide visible
4. Export or copy your writing

## Deployment to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel settings
4. Deploy

## Project Structure

```
mystyleguide/
├── app/
│   ├── api/              # API routes
│   ├── clips/            # Clips pages
│   ├── analyze/          # Analysis page
│   ├── guide/            # Style guide page
│   ├── write/            # Writing interface
│   └── profile/          # Settings page
├── components/
│   ├── navigation/       # Bottom nav
│   ├── clips/            # Clip components
│   ├── analyze/          # Analysis components
│   └── ui/               # shadcn components
├── lib/
│   ├── supabase.ts       # Database client
│   ├── anthropic.ts      # Claude API client
│   ├── url-parser.ts     # URL parsing
│   └── utils.ts          # Utilities
└── types/
    └── index.ts          # TypeScript types
```

## API Endpoints

- `GET/POST /api/clips` - Manage clips
- `GET/PUT/DELETE /api/clips/[id]` - Individual clip operations
- `POST /api/fetch-url` - Fetch and parse URL content
- `POST /api/analyze` - Run Claude analysis
- `GET/POST/PUT /api/style-guide` - Manage style guides
- `GET /api/health` - Environment + DB connectivity check

## Features To Add Later

- Multi-user authentication
- Search across clips
- Collections/folders
- Browser extension
- AI writing suggestions
- Import from Notion/Evernote
- Collaborative style guides

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
