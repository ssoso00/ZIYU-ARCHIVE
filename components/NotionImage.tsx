import React from "react";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
};

function isNotionImage(src: string) {
  try {
    const url = new URL(src);
    return (
      url.hostname === "prod-files-secure.s3.us-west-2.amazonaws.com" ||
      url.hostname === "secure.notion-static.com"
    );
  } catch {
    return false; // /icons/... 같은 로컬 이미지
  }
}

export default function NotionImage({ src, ...props }: Props) {
  const finalSrc = isNotionImage(src)
    ? `/api/image?src=${encodeURIComponent(src)}`
    : src;

  return <img src={finalSrc} {...props} />;
}
