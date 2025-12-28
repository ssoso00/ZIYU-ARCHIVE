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

export default async function PageContent() {
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
    <main className="hub-container">
      {/* ⚠️ 이하 JSX 전부 기존 코드 그대로 */}
    </main>
  );
}
