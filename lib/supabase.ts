import { createClient } from '@supabase/supabase-js';
import type { Analysis, Clip, StyleGuide } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database helper functions
export const db = {
  // Clips
  async getClips(filters?: { contentType?: string; tags?: string[] }) {
    let query = supabase
      .from('clips')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.contentType) {
      query = query.eq('content_type', filters.contentType);
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getClip(id: string) {
    const { data, error } = await supabase
      .from('clips')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createClip(clip: Omit<Clip, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('clips')
      .insert(clip)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateClip(id: string, updates: Partial<Omit<Clip, 'id' | 'created_at'>>) {
    const { data, error } = await supabase
      .from('clips')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteClip(id: string) {
    const { error } = await supabase.from('clips').delete().eq('id', id);
    if (error) throw error;
  },

  // Analyses
  async getAnalyses(clipId?: string) {
    let query = supabase
      .from('analyses')
      .select('*')
      .order('created_at', { ascending: false });

    if (clipId) {
      query = query.eq('clip_id', clipId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createAnalysis(analysis: Omit<Analysis, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('analyses')
      .insert(analysis)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Style Guides
  async getActiveStyleGuide() {
    const { data, error } = await supabase
      .from('style_guides')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getAllStyleGuides() {
    const { data, error } = await supabase
      .from('style_guides')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createStyleGuide(
    guide: Omit<StyleGuide, 'id' | 'created_at' | 'updated_at'>
  ) {
    // Deactivate all other guides
    await supabase
      .from('style_guides')
      .update({ is_active: false })
      .eq('is_active', true);

    const { data, error } = await supabase
      .from('style_guides')
      .insert(guide)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateStyleGuide(
    id: string,
    updates: Partial<Omit<StyleGuide, 'id' | 'created_at'>>
  ) {
    const { data, error } = await supabase
      .from('style_guides')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
