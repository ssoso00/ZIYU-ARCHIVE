import ProfileCard from "@/components/ProfileCard";
import MusicCard from "@/components/MusicCard";
import TabbedCard from "@/components/TabbedCard";
import GalleryCircle from "@/components/GalleryCircle";
import GuestbookLinks from "@/components/GuestbookLinks";

import {
  getProfile,
  getMusicList,
  getGalleryHighlight,
  getGuestbookSummary,
  getMemoList,
  getGalleryList,
  getGuestbookMessages, // ✅ 추가
} from "@/lib/notion";

/** ✅ 핵심: Notion 임시 이미지 URL 만료 방지 (배포에서 Static으로 굳는 것 방지) */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  const [
    profile,
    musicList,
    gallery,
    memoList,
    guestbook,
    galleryList,
    guestbookMessages, // ✅ 추가
  ] = await Promise.all([
    getProfile(),
    getMusicList(),
    getGalleryHighlight(),
    getMemoList(),
    getGuestbookSummary(),
    getGalleryList(),
    getGuestbookMessages(), // ✅ 추가
  ]);

  return (
    <main className="hub-container">
      <header className="flex flex-col items-center gap-2">
        <h1 className="text-[20px] text-slate-700 smallcaps">
          🐟 🫧🫧𝒁𝑰𝒀𝑼 𝑾𝑬𝑩 𝑨𝑹𝑪𝑯𝑰𝑽𝑬 🫧🫧ﾟ🐟
        </h1>
      </header>

      {/* 좌 / 우 컬럼 구조 그대로 */}
      <section className="flex flex-col lg:flex-row gap-6 items-start">
        {/* LEFT */}
        <div className="lg:flex-[7] flex flex-col gap-6">
          <ProfileCard data={profile} />

          <div className="flex gap-6 items-stretch">
            <div className="flex-[7]">
              <TabbedCard
                memoList={memoList}
                gallery={gallery}
                guestbook={guestbook}
                guestbookMessages={guestbookMessages} // ✅ 방명록 메시지 전달
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
