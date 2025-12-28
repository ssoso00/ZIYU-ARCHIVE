import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const GUESTBOOK_DB_ID = process.env.NOTION_DB_GUESTBOOK!;
const ADMIN_PASSWORD = process.env.GUESTBOOK_ADMIN_PASSWORD || "";

function formatTitle(now: Date) {
  // "2025-12-02 16:05" 형태
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mi = String(now.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message: string = (body?.message ?? "").trim();
    const isAdmin: boolean = !!body?.isAdmin;
    const password: string = String(body?.password ?? "");

    if (!message) {
      return NextResponse.json({ error: "No message" }, { status: 400 });
    }
    if (!GUESTBOOK_DB_ID) {
      return NextResponse.json({ error: "No NOTION_DB_GUESTBOOK" }, { status: 500 });
    }

    const role: "admin" | "user" =
      isAdmin && ADMIN_PASSWORD && password === ADMIN_PASSWORD ? "admin" : "user";

    // Title property key 자동 탐색
    const dbInfo: any = await notion.databases.retrieve({ database_id: GUESTBOOK_DB_ID });
    const titleKey = Object.keys(dbInfo.properties || {}).find(
      (k) => dbInfo.properties?.[k]?.type === "title"
    );
    if (!titleKey) {
      return NextResponse.json({ error: "Guestbook DB has no title property" }, { status: 500 });
    }

    // role(select) property key 자동 탐색 (있으면 사용)
    const roleKey = Object.keys(dbInfo.properties || {}).find((k) => {
      const p = dbInfo.properties?.[k];
      // 속성명은 자유(ROLE/Role/role 등) - 타입이 select면 ok
      return p?.type === "select" && String(k).toLowerCase() === "role";
    }) || null;

    const title = formatTitle(new Date());

    const properties: any = {
      [titleKey]: { title: [{ text: { content: title } }] },
    };

    if (roleKey) {
      properties[roleKey] = { select: { name: role } };
    }

    await notion.pages.create({
      parent: { database_id: GUESTBOOK_DB_ID },
      properties,
      children: [
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [{ type: "text", text: { content: message } }],
          },
        },
      ],
    });

    return NextResponse.json({ ok: true, role });
  } catch (e: any) {
    console.error("Guestbook save failed:", e);
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
