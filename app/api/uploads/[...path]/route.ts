import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { LOCAL_STORAGE_DIR } from "@/lib/storage";

const CONTENT_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

// Serves files from the local dev-fallback storage directory (see
// lib/storage.ts for why this exists as its own route rather than
// public/ static serving). Never hit in a real deployment - once Spaces
// credentials are set, uploadFile() returns a Spaces URL instead and this
// route sees no traffic.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  // Reject any segment that could escape LOCAL_STORAGE_DIR (path traversal).
  if (segments.some((s) => s === ".." || s.includes("/") || s.includes("\\"))) {
    return NextResponse.json({ error: "invalid path" }, { status: 400 });
  }

  const filePath = path.join(LOCAL_STORAGE_DIR, ...segments);
  if (!filePath.startsWith(LOCAL_STORAGE_DIR)) {
    return NextResponse.json({ error: "invalid path" }, { status: 400 });
  }

  try {
    const bytes = await fs.readFile(filePath);
    const contentType = CONTENT_TYPES[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
