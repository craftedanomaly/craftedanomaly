import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const paths: string[] = Array.isArray(body?.paths) && body.paths.length > 0 ? body.paths : ['/'];

    for (const p of paths) {
      revalidatePath(p);
    }

    return NextResponse.json({ revalidated: true, paths });
  } catch (e: any) {
    return NextResponse.json({ revalidated: false, error: e?.message || String(e) }, { status: 500 });
  }
}
