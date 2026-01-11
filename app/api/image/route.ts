import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAllowedHost(url: URL) {
  const h = url.hostname;
  return (
    h === "prod-files-secure.s3.us-west-2.amazonaws.com" ||
    h === "secure.notion-static.com" ||
    h.endsWith(".amazonaws.com")
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const src = searchParams.get("src");

  if (!src) return new NextResponse("Missing src", { status: 400 });

  let target: URL;
  try {
    target = new URL(src);
  } catch {
    return new NextResponse("Invalid src", { status: 400 });
  }

  if (!isAllowedHost(target)) {
    return new NextResponse("Forbidden host", { status: 403 });
  }

  // ✅ 핵심: 서버는 항상 최신으로 가져온다(만료/캐시 고정 방지)
  const upstream = await fetch(target.toString(), {
    cache: "no-store",
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    return new NextResponse(text, { status: upstream.status });
  }

  const contentType = upstream.headers.get("content-type") ?? "image/*";
  const buf = await upstream.arrayBuffer();

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      // 브라우저 캐시만 허용
      "Cache-Control": "public, max-age=3600",
    },
  });
}
