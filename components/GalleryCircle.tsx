"use client";

type Props = {
  /** 중앙 고정 카드 이미지 (Notion: card image) */
  image: string | null;
};

export default function GalleryCircle({ image }: Props) {
  return (
    /* 부모에서 준 높이를 그대로 사용 */
    <div className="w-full h-full flex items-center justify-center">
      <div
        className="
          w-full
          h-full
          max-w-[260px]
          rounded-[36px]
          overflow-hidden
          bg-gradient-to-br from-hubAccent2 to-hubAccent
          shadow-[0_24px_60px_rgba(47,155,255,0.45)]
          flex items-center justify-center
        "
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt="cardimage"
            className="
              w-full
              h-full
              object-cover
            "
          />
        ) : (
          <div className="text-white text-xs smallcaps opacity-70">
            card image
          </div>
        )}
      </div>
    </div>
  );
}
