import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { pipeline } from 'stream';
import { Readable } from 'stream';
import { promisify } from 'util';

export const runtime = 'nodejs';

const pump = promisify(pipeline);

function getBackendBase() {
  const fromPublic = process.env.NEXT_PUBLIC_BACKEND_URL;
  const fromPayload = process.env.PAYLOAD_API_URL?.replace(/\/api$/, '');
  return fromPublic || fromPayload;
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export async function GET() {
  try {
    const base = getBackendBase();
    if (!base) {
      return NextResponse.json({ ok: false, error: 'BACKEND_URL not configured' }, { status: 500 });
    }

    const metaUrl = `${base}/api/globals/video-inicial`;
    const metaRes = await fetch(metaUrl, { cache: 'no-store' });
    if (!metaRes.ok) {
      return NextResponse.json({ ok: false, error: `Meta fetch failed: ${metaRes.status}` }, { status: 502 });
    }
    const meta = await metaRes.json();
    const updatedAt: string | undefined = meta?.updatedAt;
    const videoPath: string | undefined = meta?.video?.url;
    if (!videoPath) {
      return NextResponse.json({ ok: false, error: 'No video url in meta' }, { status: 404 });
    }

    const cacheDir = path.join(process.cwd(), 'public', 'cache');
    ensureDir(cacheDir);
    const filePath = path.join(cacheDir, 'hero.mp4');
    const tmpPath = path.join(cacheDir, 'hero.tmp');
    const infoPath = path.join(cacheDir, 'hero.meta.json');

    let upToDate = false;
    if (fs.existsSync(filePath) && fs.existsSync(infoPath)) {
      try {
        const info = JSON.parse(fs.readFileSync(infoPath, 'utf-8')) as { updatedAt?: string; url?: string };
        upToDate = Boolean(updatedAt && info.updatedAt === updatedAt);
      } catch {
        // ignore
      }
    }

    if (upToDate) {
      return NextResponse.json({ ok: true, status: 'unchanged', url: '/cache/hero.mp4' });
    }

    const videoUrl = `${base}${videoPath}`;
    const vidRes = await fetch(videoUrl);
    if (!vidRes.ok || !vidRes.body) {
      return NextResponse.json({ ok: false, error: `Video fetch failed: ${vidRes.status}` }, { status: 502 });
    }

    // Stream to temp file then atomically rename
    const nodeStream = Readable.fromWeb(vidRes.body as any);
    const out = fs.createWriteStream(tmpPath);
    await pump(nodeStream, out);
    fs.renameSync(tmpPath, filePath);

    const metaToSave = { updatedAt, url: videoPath, downloadedAt: new Date().toISOString() };
    fs.writeFileSync(infoPath, JSON.stringify(metaToSave, null, 2));

    return NextResponse.json({ ok: true, status: 'refreshed', url: '/cache/hero.mp4' });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'unknown' }, { status: 500 });
  }
}

