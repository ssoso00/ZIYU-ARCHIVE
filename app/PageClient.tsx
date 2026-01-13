"use client";

import { useEffect, useState } from "react";
import LoadingScreen from "@/components/LoadingScreen";

type Props = {
  children: React.ReactNode;
  /** 로딩 화면에 표시할 이모지 (기본 💙) */
  emoji?: string;
  /** 로딩 유지 시간(ms) (기본 1800ms) */
  durationMs?: number;
};

export default function PageClient({
  children,
  emoji = "💙",
  durationMs = 1800,
}: Props) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), durationMs);
    return () => clearTimeout(timer);
  }, [durationMs]);

  if (loading) {
    return <LoadingScreen emoji={emoji} />;
  }

  return <>{children}</>;
}
