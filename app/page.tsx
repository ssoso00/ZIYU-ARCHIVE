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
  getGuestbookMessages,
} from "@/lib/notion";

/** ✅ 핵심: Notion 임시 이미지 URL 만료 방지 (배포에서 Static으로 굳는 것 방지) */
export const dynamic = "force-dynamic";
export const revalidate = 0;

import PageClient from "./PageClient";

export default async function Page() {
  const [
    profile,
    musicList,
    gallery,
    memoList,
    guestbook,
    galleryList,
    guestbookMessages,
  ] = await Promise.all([
    getProfile(),
    getMusicList(),
    getGalleryHighlight(),
    getMemoList(),
    getGuestbookSummary(),
    getGalleryList(),
    getGuestbookMessages(),
  ]);

  return (
    <PageClient
      profile={profile}
      musicList={musicList}
      gallery={gallery}
      memoList={memoList}
      guestbook={guestbook}
      galleryList={galleryList}
      guestbookMessages={guestbookMessages}
    />
  );
}
