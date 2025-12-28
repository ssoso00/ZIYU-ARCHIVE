
"use client";

import type { GuestbookSummary } from "@/lib/notion";

export default function GuestbookLinks({ data }: { data: GuestbookSummary | null }) {
  const count = data?.count ?? 0;

  const open = (url: string) => {
    if (!url) return;
    window.open(url, "_blank");
  };

  return (
<div className="card p-8 md:p-10 flex flex-col">

  <div className="space-y-3">

        <button
          onClick={() => open(data?.url1 || "")}
          className="w-full h-10 rounded-full bg-sky-50 flex items-center justify-between px-5 text-[12px] text-slate-600"
        >
          <span>{data?.url1Name || "[YouTube]_ZIYU"}</span>
            <img
    src="/icons/youtube.png"
    alt="youtube"
    className="w-6 h-4 opacity-90"
  />
        </button>
        <button
          onClick={() => open(data?.url2 || "")}
          className="w-full h-10 rounded-full bg-sky-50 flex items-center justify-between px-5 text-[12px] text-slate-600"
        >
          <span>{data?.url2Name || "[Weibo]_ZIYU"}</span>
           <img src="/icons/Weibo.jpg"
    alt="Weibo"
    className="w-4 h-4 opacity-90"
    />
        </button>
        <button
          onClick={() => open(data?.url3 || "")}
          className="w-full h-10 rounded-full bg-sky-50 flex items-center justify-between px-5 text-[12px] text-slate-600"
        >
          <span>{data?.url3Name || "[나무위키]_ZIYU"}</span>
           <img src="/icons/Naver.png"
    alt="Naver"
    className="w-4 h-4 opacity-90"
    />
        </button>
          <button
          onClick={() => open(data?.url4 || "")}
          className="w-full h-10 rounded-full bg-sky-50 flex items-center justify-between px-5 text-[12px] text-slate-600"
        >
          <span>{data?.url4Name || "[INSTAGRAM]_ZIYU"}</span>
            <img src="/icons/Instagram.png"
    alt="Instagram"
    className="w-4 h-4 opacity-90"
    />
        </button>
      </div>
    </div>
  );
}
