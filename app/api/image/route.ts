import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return new Response("Missing url", { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        // ❗ 중요: Notion S3는 UA 없으면 차단하는 경우 있음
        "User-Agent": "Mozilla/5.0",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return new Response("Failed to fetch image", {
        status: res.status,
      });
    }

    const contentType =
      res.headers.get("content-type") || "image/jpeg";

    const buffer = await res.arrayBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (e) {
    return new Response("Image proxy error", { status: 500 });
  }
}
