import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const src = req.nextUrl.searchParams.get("src");
  if (!src) return new NextResponse("Missing src", { status: 400 });

  // 보안상 허용 호스트 제한 (노션/노션S3만)
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return new NextResponse("Invalid src", { status: 400 });
  }

  const allowedHosts = new Set([
    "prod-files-secure.s3.us-west-2.amazonaws.com",
    "secure.notion-static.com",
  ]);

  if (!allowedHosts.has(url.hostname)) {
    return new NextResponse("Host not allowed", { status: 403 });
  }

  // signed URL은 만료되므로 서버/브라우저가 길게 캐시하면 문제 악화
  const upstream = await fetch(src, { cache: "no-store" });
  if (!upstream.ok) {
    return new NextResponse(`Upstream error: ${upstream.status}`, { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
  const body = await upstream.arrayBuffer();

  // CDN 캐시를 쓰고 싶으면 s-maxage를 짧게
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
    },
  });
}
