import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return new NextResponse("Missing url", { status: 400 });
  }

  try {
    const res = await fetch(imageUrl, {
      headers: {
        // Notion 이미지 fetch 안정화
        "User-Agent": "Mozilla/5.0",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return new NextResponse("Failed to fetch image", {
        status: res.status,
      });
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return new NextResponse("Image proxy error", { status: 500 });
  }
}
