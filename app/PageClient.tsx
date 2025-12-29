"use client";

import { useEffect, useState } from "react";

import ProfileCard from "@/components/ProfileCard";
import MusicCard from "@/components/MusicCard";
import TabbedCard from "@/components/TabbedCard";
import GalleryCircle from "@/components/GalleryCircle";
import GuestbookLinks from "@/components/GuestbookLinks";
import LoadingScreen from "@/components/LoadingScreen";

import type {
  ProfileData,
  MusicData,
  GalleryData,
  MemoItem,
  GuestbookSummary,
  GalleryItem,
  GuestbookMessage,
} from "@/lib/notion";

type Props = {
  profile: ProfileData | null;
  musicList: MusicData[];
  gallery: GalleryData | null;
  memoList: MemoItem[];
  guestbook: GuestbookSummary | null;
  galleryList: GalleryItem[];
  guestbookMessages: GuestbookMessage[];
};

export default function PageClient({
  profile,
  musicList,
  gallery,
  memoList,
  guestbook,
  galleryList,
  guestbookMessages,
}: Props) {
  /* ================= 로딩 상태 ================= */
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1800); // ⏱ 기본 로딩 시간 (원하면 조절)

    return () => clearTimeout(timer);
  }, []);

  /* ================= 로딩 화면 ================= */
  if (loading) {
    return <LoadingScreen emoji="💙" />;
  }

  /* ================= 실제 페이지 ================= */
  return (
    <main className="hub-container">
      <header className="flex flex-col items-center gap-2">
        <h1 className="text-[18x] text-slate-700 smallcaps">
          🐟 🫧🫧𝒁𝑰𝒀𝑼 𝑾𝑬𝑩 𝑨𝑹𝑪𝑯𝑰𝑽𝑬 🫧🫧ﾟ🐟
        </h1>
      </header>

      {/* 좌 / 우 컬럼 구조 그대로 */}
<section className="flex flex-row gap-6 items-start">
        {/* LEFT */}
        <div className="lg:flex-[7] flex flex-col gap-6">
          <ProfileCard data={profile} />

          <div className="flex gap-6 items-stretch">
            <div className="flex-[7]">
              <TabbedCard
                memoList={memoList}
                gallery={gallery}
                guestbook={guestbook}
                guestbookMessages={guestbookMessages}
                galleryList={galleryList}
              />
            </div>

            <div className="flex-[3]">
              <div className="h-[480px] w-full">
                <GalleryCircle image={guestbook?.cardImage ?? null} />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:flex-[2] flex flex-col gap-6">
          <div className="flex justify-center">
            <MusicCard list={musicList} />
          </div>

          <div className="flex justify-center">
            <div className="w-full">
              <GuestbookLinks data={guestbook} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
