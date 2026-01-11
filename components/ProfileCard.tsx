"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ProfileData } from "@/lib/notion";
import NotionImage from "@/components/NotionImage"; // ✅ 추가


export default function ProfileCard({ data }: { data: ProfileData | null }) {
  const [expanded, setExpanded] = useState(false);

  if (!data) {
    return <div className="card p-10">No profile data</div>;
  }

  return (
    <div className="card relative overflow-hidden p-10">
      <AnimatePresence mode="wait">
        {/* ===================== 기본 카드 ===================== */}
        {!expanded ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex gap-8 items-center">
              {/* 프로필 이미지 */}
              <div className="w-[180px] h-[240px] rounded-[36px] overflow-hidden flex-shrink-0">
                {data.profileImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                 <NotionImage src={data.profileImage}
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* 텍스트 영역 */}
              <div className="flex-1">
                <div className="text-[30px] font-semibold flex items-center gap-2">
                  {data.mainText}
                </div>

                <div className="mt-3 text-[14px] text-slate-600 leading-relaxed">
                  {data.subText}
                </div>
                
              </div>
            </div>

            {/* 전환 버튼 */}
            <button
              onClick={() => setExpanded(true)}
              className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center"
              aria-label="expand profile"
            >
              {data.toggleEmoji}
            </button>
          </motion.div>
        ) : (
          /* ===================== 전환 카드 ===================== */
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25 }}
          >
            {/* 상단 헤더 */}
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => setExpanded(false)}
                className="text-sm text-slate-500 flex items-center gap-2"
              >
                <span>👤</span>
                <span>Profiles</span>
              </button>

              <button
                onClick={() => setExpanded(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
                aria-label="close"
              >
                ˅
              </button>
            </div>

            {/* pair 카드 영역 */}
            <div className="grid grid-cols-2 gap-6">
              {[data.pair1, data.pair2].map((pair, idx) => (
                <div key={idx} className="text-center">
                  <div className="w-full h-[220px] rounded-2xl overflow-hidden bg-slate-100">
                    {pair.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                     <NotionImage src={pair.image}
                        alt={pair.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div className="mt-3">
                    <div className="text-sm font-medium">{pair.name}</div>
                    <div className="text-xs text-slate-500">{pair.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
