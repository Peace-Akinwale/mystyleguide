import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { getErrorMessage, pickErrorDetails } from '@/lib/error-utils';

export async function GET() {
  const env = {
    hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    hasSupabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    hasSupabaseServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    hasAnthropicKey: Boolean(process.env.ANTHROPIC_API_KEY),
    anthropicModel:
      process.env.ANTHROPIC_MODEL?.trim() || 'claude-3-5-sonnet-latest',
  };

  const supabase: Record<string, unknown> = { ok: false };
  try {
    const { error } = await supabaseServer.from('clips').select('id').limit(1);
    if (error) throw error;
    supabase.ok = true;
  } catch (error) {
    supabase.ok = false;
    supabase.error = getErrorMessage(error);
    supabase.details = pickErrorDetails(error);
  }

  const anthropic = {
    ok: env.hasAnthropicKey,
    model: env.anthropicModel,
  };

  const ok = Boolean(supabase.ok) && anthropic.ok;

  return NextResponse.json({ ok, env, supabase, anthropic });
}

