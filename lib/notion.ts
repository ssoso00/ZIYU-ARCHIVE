import { Client } from "@notionhq/client";

const token = process.env.NOTION_TOKEN;
export const notion = new Client({ auth: token });

/* -------------------- UTIL -------------------- */

type NotionFile = { file?: { url: string }; external?: { url: string } };
export type FileUrl = string | null;

function first<T>(arr: T[] | undefined | null): T | null {
  return arr && arr.length ? arr[0] : null;
}

function fileUrlFromFilesProp(filesProp: any): FileUrl {
  const files = filesProp?.files as NotionFile[] | undefined;
  const f = first(files);
  if (!f) return null;

const rawUrl = f.file?.url ?? f.external?.url ?? null;
return rawUrl ? `/api/image?url=${encodeURIComponent(rawUrl)}` : null;
}


function plainFromTitle(prop: any): string {
  const t = prop?.title;
  if (!Array.isArray(t)) return "";
  return t.map((x: any) => x.plain_text).join("");
}

function plainFromRich(prop: any): string {
  const t = prop?.rich_text;
  if (!Array.isArray(t)) return "";
  return t.map((x: any) => x.plain_text).join("");
}

function getProp(props: any, ...names: string[]) {
  for (const n of names) {
    if (props?.[n]) return props[n];
  }
  return null;
}

/* -------------------- PROFILE -------------------- */

export type ProfileData = {
  pageName: string;
  mainText: string;
  subText: string;
  profileImage: string | null;
  toggleEmoji: string;

  pair1: { image: string | null; name: string; sub: string };
  pair2: { image: string | null; name: string; sub: string };
};

export async function getProfile(): Promise<ProfileData | null> {
  const db = process.env.NOTION_DB_PROFILE;
  if (!db || !token) return null;

  const res = await notion.databases.query({ database_id: db, page_size: 1 });
  const page: any = res.results?.[0];
  if (!page) return null;
  const p = page.properties;

  return {
    pageName: plainFromTitle(getProp(p, "page name", "Name", "name")),
    mainText: plainFromRich(getProp(p, "main text", "main_text")),
    subText: plainFromRich(getProp(p, "sub text", "sub_text")),
    profileImage: fileUrlFromFilesProp(getProp(p, "profile")),
    toggleEmoji: plainFromRich(getProp(p, "toggle_emoji")) || "💙",

    pair1: {
      image: fileUrlFromFilesProp(getProp(p, "pair image(1)")),
      name: plainFromRich(getProp(p, "pair name(1)")),
      sub: plainFromRich(getProp(p, "pair sub text(1)")),
    },
    pair2: {
      image: fileUrlFromFilesProp(getProp(p, "pair image(2)")),
      name: plainFromRich(getProp(p, "pair name(2)")),
      sub: plainFromRich(getProp(p, "pair sub text(2)")),
    },
  };
}

/* -------------------- MUSIC -------------------- */

export type MusicData = {
  title: string;
  singer: string;
  cover: FileUrl;
  url: string;
  order: number;
};

export async function getMusicList(): Promise<MusicData[]> {
  const db = process.env.NOTION_DB_MUSIC;
  if (!db || !token) return [];

  const res = await notion.databases.query({
    database_id: db,
    sorts: [{ property: "Order", direction: "ascending" }],
  });

  return res.results.map((page: any) => {
    const p = page.properties;
    return {
      title: getTitleProp(p) || "Unknown Title",
      singer: plainFromRich(getProp(p, "Artist", "singer")) || "Unknown Artist",
      cover: fileUrlFromFilesProp(getProp(p, "Cover", "cover")),
      url: getProp(p, "YouTube", "URL", "url")?.url ?? "",
      order: p?.Order?.number ?? 0,
    };
  });

  function getTitleProp(props: any): string {
    const key = Object.keys(props || {}).find((k) => props[k]?.type === "title");
    if (!key) return "";
    return plainFromTitle(props[key]);
  }
}

/* -------------------- GALLERY (TAB) -------------------- */

export type GalleryData = {
  title: string;
  image: FileUrl;
};

export async function getGalleryHighlight(): Promise<GalleryData | null> {
  const db = process.env.NOTION_DB_GALLERY;
  if (!db || !token) return null;

  const res = await notion.databases.query({ database_id: db, page_size: 1 });
  const page: any = res.results?.[0];
  if (!page) return null;
  const p = page.properties;

  return {
    title: plainFromTitle(getProp(p, "name", "Name")) || "Gallery",
    image: fileUrlFromFilesProp(getProp(p, "image", "Image")),
  };
}

/* -------------------- MEMO LIST (BOARD) -------------------- */

export type MemoItem = {
  id: string;
  title: string;
  images: string[];
  dateText: string;
};

export async function getMemoList(): Promise<MemoItem[]> {
  const db = process.env.NOTION_DB_MEMO;
  if (!db || !token) return [];

  const res = await notion.databases.query({
    database_id: db,
    sorts: [{ property: "date", direction: "descending" }],
  });

  return res.results.map((page: any) => {
    const p = page.properties;

    const dateStart = getProp(p, "date")?.date?.start;
    let dateText = "";
    if (dateStart) {
      const d = new Date(dateStart);
      const dd = String(d.getDate()).padStart(2, "0");
      const month = d.toLocaleString("en-US", { month: "long" }).toUpperCase();
      dateText = `${dd} ${month}`;
    }

    const files = getProp(p, "image")?.files ?? [];
    const images: string[] = files
      .map((f: any) => f.file?.url || f.external?.url)
      .filter(Boolean);

    return {
      id: page.id,
      title: plainFromTitle(getProp(p, "name", "Name")),
      images,
      dateText,
    };
  });
}

/* -------------------- GUESTBOOK -------------------- */

export type GuestbookSummary = {
  count: number;
  quartMain: string;
  quartSub: string;
  url1: string;
  url1Name: string;
  url2: string;
  url2Name: string;
  url3: string;
  url3Name: string;
  url4: string;
  url4Name: string;
  cardImage: FileUrl;
};

export async function getGuestbookSummary(): Promise<GuestbookSummary | null> {
  const db = process.env.NOTION_DB_GUESTBOOK;
  if (!db || !token) return null;

  const res = await notion.databases.query({ database_id: db, page_size: 50 });
  const pages: any[] = res.results as any[];

  const count = Math.max(0, pages.length - 1);
  const setting =
    pages.find(
      (pg) =>
        (plainFromTitle(getProp(pg.properties, "Name", "name")) || "")
          .toLowerCase() === "setting"
    ) || pages[0];

  const p = setting?.properties ?? {};

  return {
    count,
    quartMain: plainFromRich(getProp(p, "quart main")) || "Say Hi! : ZIYU",
    quartSub: plainFromRich(getProp(p, "quart sub")) || "[방명록]",
    url1Name: plainFromRich(getProp(p, "URL1_name")) || "[YouTube]_ZIYU",
    url1: getProp(p, "URL1", "url1")?.url ?? "",
    url2Name: plainFromRich(getProp(p, "URL2_name")) || "[Weibo]_ZIYU",
    url2: getProp(p, "URL2", "url2")?.url ?? "",
    url3Name: plainFromRich(getProp(p, "URL3_name")) || "[나무위키]_ZIYU",
    url3: getProp(p, "URL3", "url3")?.url ?? "",
    url4Name: plainFromRich(getProp(p, "URL4_name")) || "[INSTAGRAM]_ZIYU",
    url4: getProp(p, "URL4", "url4")?.url ?? "",
    cardImage: fileUrlFromFilesProp(getProp(p, "card image")),
  };
}

/* -------------------- GUESTBOOK MESSAGES (✅ children까지 불러오기) -------------------- */

export type GuestbookMessage = {
  id: string;
  title: string; // 페이지 제목(날짜/시간)
  content: string; // 본문(children)
  createdAt: string;
  role: "user" | "admin";
};

function getTitleKeyFromProps(props: any): string | null {
  const key = Object.keys(props || {}).find((k) => props[k]?.type === "title");
  return key ?? null;
}

function getRoleFromProps(props: any): "user" | "admin" {
  // role 속성이 없다면 기본 user
  const roleProp =
    props?.role ??
    props?.Role ??
    props?.ROLE ??
    null;

  const name = roleProp?.select?.name;
  return name === "admin" ? "admin" : "user";
}

async function fetchAllBlocksPlainText(pageId: string): Promise<string> {
  // children(블록) 텍스트를 가능한 범위에서 전부 합침
  // (Paragraph / Heading / Quote 등 rich_text 기반은 대부분 커버)
  const texts: string[] = [];
  let cursor: string | undefined = undefined;

  for (;;) {
    const res: any = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 50,
      start_cursor: cursor,
    });

    for (const block of res.results ?? []) {
      const type = block.type;
      const rich = block?.[type]?.rich_text;
      if (Array.isArray(rich)) {
        const t = rich.map((r: any) => r.plain_text).join("");
        if (t) texts.push(t);
      }
    }

    if (!res.has_more) break;
    cursor = res.next_cursor;
    if (!cursor) break;
  }

  return texts.join("\n");
}

export async function getGuestbookMessages(): Promise<GuestbookMessage[]> {
  const db = process.env.NOTION_DB_GUESTBOOK;
  if (!db || !token) return [];

  const res = await notion.databases.query({
    database_id: db,
    sorts: [{ timestamp: "created_time", direction: "ascending" }],
    page_size: 100,
  });

  const pages: any[] = res.results as any[];

  // setting 페이지 제외(제목이 setting인 row)
  const filtered = pages.filter((pg) => {
    const props = pg?.properties ?? {};
    const titleKey = getTitleKeyFromProps(props);
    const title = titleKey ? plainFromTitle(props[titleKey]) : "";
    return title.toLowerCase() !== "setting";
  });

  const out: GuestbookMessage[] = [];
  for (const pg of filtered) {
    const props = pg?.properties ?? {};
    const titleKey = getTitleKeyFromProps(props);
    const title = titleKey ? plainFromTitle(props[titleKey]) : "";
    const content = await fetchAllBlocksPlainText(pg.id);

    out.push({
      id: pg.id,
      title,
      content,
      createdAt: pg.created_time,
      role: getRoleFromProps(props),
    });
  }

  return out;
}

/* -------------------- GALLERY LIST (MODAL) -------------------- */

export type GalleryItem = {
  id: string;
  title: string;
  image: FileUrl;
};

export async function getGalleryList(): Promise<GalleryItem[]> {
  const db = process.env.NOTION_DB_GALLERY;
  if (!db || !token) return [];

  const res = await notion.databases.query({
    database_id: db,
    sorts: [{ timestamp: "created_time", direction: "ascending" }],
  });

  return res.results.map((page: any) => {
    const p = page.properties;
    return {
      id: page.id,
      title: plainFromTitle(getProp(p, "name", "Name")) || "Gallery",
      image: fileUrlFromFilesProp(getProp(p, "image", "Image")),
    };
  });
}
