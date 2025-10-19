import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      return NextResponse.json({ ok: false, error: 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY' }, { status: 500 });
    }

    const supabase = createClient(url, key);

    const { data, error } = await supabase
      .from('site_settings')
      .select('id, about_title, about_text, about_image_url')
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ ok: false, stage: 'columns', error: error.message }, { status: 500 });
    }

    if (data && (data.about_title || data.about_text || data.about_image_url)) {
      return NextResponse.json({ ok: true, source: 'columns', data });
    }

    // fallback to key-value style
    const { data: kv, error: kvErr } = await supabase
      .from('site_settings')
      .select('setting_key, setting_value');

    if (kvErr) {
      return NextResponse.json({ ok: false, stage: 'keyvalue', error: kvErr.message }, { status: 500 });
    }

    const map: Record<string, string> = {};
    kv?.forEach((row: any) => {
      if (row?.setting_key) map[row.setting_key] = row.setting_value;
    });

    return NextResponse.json({
      ok: true,
      source: 'keyvalue',
      data: {
        about_title: map['about_title'] ?? map['about_title_en'] ?? null,
        about_text: map['about_text'] ?? map['about_text_en'] ?? null,
        about_image_url: map['about_image_url'] ?? null,
      }
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}
