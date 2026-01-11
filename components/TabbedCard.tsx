"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import NotionImage from "@/components/NotionImage"; // ✅ 추가

import type {
  GalleryData,
  GuestbookSummary,
  GuestbookMessage as NotionGuestbookMessage,
} from "@/lib/notion";

type Tab = "main" | "board" | "gallery" | "guestbook";

type MemoItem = {
  id: string;
  title: string;
  dateText: string;
  images?: string[];
};

/** ✅ Gallery 모달에 노출할 리스트 타입 (추가만) */
type GalleryItem = {
  id: string;
  title: string;
  image: string | null;
};

/** ✅ Guestbook 로컬 메시지 타입(역할 포함) */
type GuestbookMessage = {
  id: string;
  text: string;
  createdAt: number;
  role: "user" | "admin";
};

export default function TabbedCard({
  memoList,
  gallery,
  guestbook,
  galleryList,
  guestbookMessages, // ✅ 추가(옵션)
}: {
  memoList: MemoItem[];
  gallery: GalleryData | null;
  guestbook: GuestbookSummary | null;
  galleryList?: GalleryItem[];
  guestbookMessages?: NotionGuestbookMessage[]; // ✅ 추가(옵션)
}) {
  /* ================= STATE ================= */
  const [tab, setTab] = useState<Tab>("main");
  const [selected, setSelected] = useState<MemoItem | null>(null);

  /* 🔹 Gallery Modal State (추가만) */
  const [galleryOpen, setGalleryOpen] = useState(false);

  /** ✅ 모달에서 오른쪽 큰 이미지로 보여줄 선택 이미지 (추가만) */
  const [selectedGallery, setSelectedGallery] = useState<GalleryItem | null>(
    null
  );

  /** ✅ TabbedCard "바깥 클릭" 감지용 ref (추가만) */
  const cardRef = useRef<HTMLDivElement>(null);

  /* ================= DATE ================= */
  const rightDate = useMemo(() => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const month = now.toLocaleString("en-US", { month: "long" }).toUpperCase();
    return { dd, month };
  }, []);

  /* ================= PAGINATION ================= */
  const PAGE_SIZE = 5;
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil((memoList?.length ?? 0) / PAGE_SIZE));

  const pagedList = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return memoList.slice(start, start + PAGE_SIZE);
  }, [memoList, page]);

  /** ✅ main 탭으로 안전 복귀 (추가만, 기존 로직 건드리지 않음) */
  const resetToMain = () => {
    setTab("main");
    setSelected(null);
    setPage(1);
  };

  const changeTab = (next: Tab) => {
    setTab(next);
    setSelected(null);
    setPage(1);

    if (next === "gallery") {
      setGalleryOpen(true);

      // ✅ 노션 galleryList가 있으면 첫 번째를 기본 선택
      const first = (galleryList ?? [])[0] ?? null;
      setSelectedGallery(first);
    }
  };

  /* ================= ESC로 모달 닫기 ================= */
  useEffect(() => {
    if (!galleryOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setGalleryOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [galleryOpen]);

  /* ================= 모달 닫힐 때 main으로 복귀 (추가만) ================= */
  useEffect(() => {
    if (!galleryOpen) {
      // ✅ 모달이 닫히면 무조건 main 탭으로
      if (tab === "gallery") resetToMain();
      return;
    }

    // 모달이 열렸는데 선택이 없으면 첫 항목 자동 선택
    if (!selectedGallery) {
      const first = (galleryList ?? [])[0] ?? null;
      setSelectedGallery(first);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [galleryOpen]);

  /* ================= 카드 바깥(사이트 배경) 클릭 시 main으로 복귀 (추가만) ================= */
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      // ✅ 모달 열려있으면 바깥클릭 복귀 로직 금지
      if (galleryOpen) return;

      // ✅ board/guestbook 상태에서만 동작 (main은 그대로 유지)
      if (tab !== "board" && tab !== "guestbook") return;

      const el = cardRef.current;
      if (!el) return;

      // ✅ TabbedCard 내부 클릭이면 무시
      if (el.contains(e.target as Node)) return;

      // ✅ 카드 바깥 클릭이면 main으로 복귀
      resetToMain();
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [galleryOpen, tab]);

  /* ================= GUESTBOOK (Notion 로드 + 입력/저장) ================= */

  const [gbInput, setGbInput] = useState("");
  const [gbMessages, setGbMessages] = useState<GuestbookMessage[]>([]);
  const gbListRef = useRef<HTMLDivElement>(null);

  // ✅ IME(한글) 조합 상태
  const gbIsComposingRef = useRef(false);

  // ✅ 관리자 모드/비밀번호 (게스트북에서만 사용)
  const [gbAdminMode, setGbAdminMode] = useState(false);
  const [gbAdminPassword, setGbAdminPassword] = useState("");

  // ✅ 최초: 서버에서 내려온 기존 방명록(Notion) -> 로컬 state로 세팅
  useEffect(() => {
    if (!guestbookMessages) return;

    const mapped: GuestbookMessage[] = guestbookMessages
      .map((m) => ({
        id: m.id,
        text: (m.content ?? "").trim() ? m.content : "", // children 본문
        createdAt: Date.parse(m.createdAt) || Date.now(),
        role: m.role ?? "user",
      }))
      // 본문이 비어있으면(설정 페이지/빈 페이지) 제외
      .filter((m) => m.text.trim().length > 0);

    setGbMessages(mapped);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guestbookMessages]);

  const addGuestbookMessage = async () => {
    const text = gbInput.trim();
    if (!text) return;

    const role: "admin" | "user" = gbAdminMode ? "admin" : "user";

    // ✅ 1) 즉시 UI 반영(optimistic) — IME 영향 없음
    const localMsg: GuestbookMessage = {
      id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
      text,
      createdAt: Date.now(),
      role,
    };
    setGbMessages((prev) => [...prev, localMsg]);
    setGbInput("");

    // ✅ 2) 서버 저장 (관리자 검증은 서버에서)
    try {
      await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          isAdmin: gbAdminMode,
          password: gbAdminMode ? gbAdminPassword : "",
        }),
      });
    } catch (e) {
      console.error("Guestbook Notion save failed", e);
    }
  };

  // ✅ 메시지 추가되면 아래로 자동 스크롤(guestbook 탭에서만)
  useEffect(() => {
    if (tab !== "guestbook") return;
    const el = gbListRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [gbMessages, tab]);

  /* ================= VIEWS (중요: 함수 호출로 JSX 반환) ================= */

  const renderMainView = () => (
  <div className="min-h-[300px] flex items-end justify-between">
    {/* 좌측 하단 텍스트 */}
    <div className="flex flex-col gap-2">
      <div className="italic text-[40px] text-hubText">
        {guestbook?.quartMain || "Say Hi-! ZIYU"}
      </div>
      <div className="text-[20px] text-hubSub">
        {guestbook?.quartSub || "[방명록]"}
      
      </div>
      
    </div>

    {/* 우측 날짜 */}
    <div className="flex flex-col items-end leading-none">
      <div className="text-[60px] font-semibold text-slate-800">
        {rightDate.dd}
      </div>
      <div className="mt-1 text-[12px] tracking-wide text-slate-400">
        {rightDate.month}
      </div>
  
    </div>
  </div>
);


  const renderBoardListView = () => (
    <>
      <ul className="space-y-5">
        {pagedList.map((item) => (
          <li
            key={item.id}
            className="cursor-pointer hover:opacity-70"
            onClick={() => setSelected(item)}
          >
            <div className="text-[16px] font-medium text-slate-700">
              {item.title}
            </div>
            <div className="mt-1 text-[12px] text-slate-400">
              {item.dateText}
            </div>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="mt-8 flex gap-2 flex-wrap">
          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={
                  "px-3 py-1 rounded-full text-[12px] " +
                  (p === page
                    ? "bg-sky-400 text-white"
                    : "bg-sky-50 text-slate-500 hover:bg-sky-100")
                }
              >
                {p}
              </button>
            );
          })}
        </div>
      )}
    </>
  );

  const renderBoardReadView = (item: MemoItem) => (
    <div>
      <button
        onClick={() => setSelected(null)}
        className="text-[12px] text-slate-500 hover:text-slate-700"
      >
        ← back
      </button>

      <div className="mt-4 text-[16px] font-semibold text-slate-700">
        {item.title}
      </div>

      <div className="mt-4 space-y-4 max-h-[260px] overflow-y-auto">
        {(item.images ?? []).map((src, i) => (
         <NotionImage
            key={i}
            src={src}
            alt="memo"
            className="w-full rounded-[20px] object-cover"
          />
        ))}
      </div>
    </div>
  );

  const renderGalleryView = () => (
    <div className="italic text-[18px] text-hubText">
      {gallery?.title || "Gallery"}
    </div>
  );

  /** ✅ GuestbookView: 상단 텍스트 유지 + 입력/대화 UI */
  const renderGuestbookView = () => (
    <>
      <div className="mt-6 flex flex-col gap-4">
        {/* 메시지 리스트 */}
        <div
          ref={gbListRef}
          className="h-[220px] overflow-y-auto pr-2 space-y-3 flex flex-col"
        >
          {gbMessages.length === 0 ? (
            <div className="text-[12px] text-slate-400">
              아직 메시지가 없어요. 아래 입력창에 남겨보세요.
            </div>
          ) : (
            gbMessages.map((m) => {
              const isAdmin = m.role === "admin";
              return (
                <div
                  key={m.id}
                  className={
                    "w-full flex " + (isAdmin ? "justify-start" : "justify-end")
                  }
                >
                  <div
                    className={
                      "max-w-[75%] rounded-2xl px-4 py-3 text-[13px] text-slate-700 whitespace-pre-wrap " +
                      (isAdmin ? "bg-sky-100" : "bg-slate-50")
                    }
                  >
                    {m.text}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 관리자 모드 토글 + 비번 */}
        <div className="flex items-center justify-between px-2">
          <label className="flex items-center gap-2 text-[12px] text-slate-500 select-none">
            <input
              type="checkbox"
              checked={gbAdminMode}
              onChange={(e) => setGbAdminMode(e.target.checked)}
            />
            관리자 메시지로 남기기
          </label>

          {gbAdminMode && (
            <input
              type="password"
              value={gbAdminPassword}
              onChange={(e) => setGbAdminPassword(e.target.value)}
              placeholder="관리자 비밀번호"
              className="w-[160px] rounded-full bg-slate-50 px-3 py-2 text-[12px] text-slate-700 outline-none placeholder:text-slate-400"
            />
          )}
        </div>

        {/* 입력 영역 */}
        <div className="flex items-center gap-3 bg-slate-50 rounded-full px-4 py-3">
          <input
            value={gbInput}
            onCompositionStart={() => {
              gbIsComposingRef.current = true;
            }}
            onCompositionEnd={(e) => {
              gbIsComposingRef.current = false;
              setGbInput(e.currentTarget.value);
            }}
            onChange={(e) => {
              setGbInput(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (gbIsComposingRef.current) return;
                e.preventDefault();
                addGuestbookMessage();
              }
            }}
            placeholder="Leave a note..."
            className="flex-1 bg-transparent outline-none text-[13px] text-slate-700 placeholder:text-slate-400"
          />
          <button
            onClick={addGuestbookMessage}
            className="h-8 px-4 rounded-full bg-slate-300 text-white text-[12px] hover:bg-slate-400 transition"
          >
            SEND
          </button>
        </div>
      </div>
    </>
  );

  const body = (() => {
    if (tab === "main") return renderMainView();
    if (tab === "board")
      return selected ? renderBoardReadView(selected) : renderBoardListView();
    if (tab === "gallery") return renderGalleryView();
    return renderGuestbookView();
  })();

  return (
    <>
      {/* ================= 기존 카드 (구조 유지, ref만 추가) ================= */}
      <div
        ref={cardRef}
className="card p-6 flex flex-col justify-between h-full"      >
        <div>
          <div className="flex items-center gap-5 text-[12px] smallcaps text-slate-400">
            {(["board", "gallery", "guestbook"] as Tab[]).map((k) => (
              <button
                key={k}
                onClick={() => changeTab(k)}
                className={
                  "pb-1 border-b " +
                  (tab === k
                    ? "border-hubAccent text-slate-700"
                    : "border-transparent")
                }
              >
                {k}
              </button>
            ))}

            <div className="ml-auto text-[11px] text-slate-400">
              {rightDate.dd} <span className="ml-1">{rightDate.month}</span>
            </div>
          </div>

          <div className="mt-8">{body}</div>
        </div>

        <div className="mt-8 flex justify-between items-center text-[11px] text-slate-400">
        {tab !== "guestbook" && (
  <div className="mt-8 flex justify-between items-center text-[11px] text-slate-400">
  </div>
)}

        </div>
        
        
      </div>

      {/* ================= Gallery Modal (유지) ================= */}
      {galleryOpen && (
  <div
    id="gallery-modal-overlay"
    className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex items-center justify-center"
    onClick={() => setGalleryOpen(false)}
  >

          <div
            onClick={(e) => e.stopPropagation()}
            className="
              w-[92vw] max-w-[1100px] h-[80vh]
              bg-white rounded-[28px] shadow-2xl
              overflow-hidden
              animate-[fadeIn_0.35s_ease]
            "
          >
            {/* ================= Mac Header ================= */}
            <div className="flex items-center px-6 py-4 border-b h-[56px]">
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="ml-auto text-[12px] text-slate-500">
                My Gallery
              </div>
            </div>

            {/* ================= Body ================= */}
            <div className="flex h-[calc(100%-56px)]">
              {/* Left thumbnails (✅ 노션 연결) */}
              <div className="w-[260px] border-r p-4 space-y-3 overflow-y-auto">
                {(galleryList ?? []).length === 0 ? (
                  <div className="text-[12px] text-slate-400 leading-relaxed">
                    galleryList 데이터가 아직 전달되지 않았어요.
                    <br />
                    (page.tsx에서 getGalleryList()로 리스트를 내려줘야 썸네일이
                    나옵니다)
                  </div>
                ) : (
                  (galleryList ?? []).map((item) => {
                    const active = selectedGallery?.id === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setSelectedGallery(item)}
                        className={
                          "w-full text-left rounded-2xl p-2 transition " +
                          (active ? "bg-sky-50" : "hover:bg-slate-50")
                        }
                      >
                        <div className="w-full h-[120px] rounded-xl bg-slate-100 overflow-hidden">
                          {item.image ? (
                           <NotionImage src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[12px] text-slate-400">
                              no image
                            </div>
                          )}
                        </div>
                        <div className="mt-2 text-[11px] text-slate-500 truncate px-1">
                          {item.title}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Right main image (✅ 노션 연결) */}
              <div className="flex-1 p-6 flex items-center justify-center overflow-hidden">
                {selectedGallery?.image ? (
                <NotionImage src={selectedGallery.image}
                    alt={selectedGallery.title}
                    className="max-w-full max-h-full rounded-[24px] object-contain bg-slate-50"
                  />
                ) : (
                  <div className="w-full h-full rounded-[24px] bg-slate-100 flex items-center justify-center text-slate-400">
                    no image selected
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
