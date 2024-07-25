import { NewsResponse } from "@/types/news";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";

export default function RecentStockNewsItem({
  headLine,
  media,
  image,
  creationTime,
  relatedStocks,
  newsId,
}: NewsResponse) {
  dayjs.extend(relativeTime);
  dayjs.locale("ko");
  // 현재 시간
  const now = dayjs();
  // 과거 시간
  const pastTime = dayjs(creationTime);
  // 상대 시간 계산
  const relativeTimeString = pastTime.from(now);

  return (
    <>
      <Link href={`/news/${newsId}`}>
        <div className="flex justify-start items-center  flex-shrink-0 relative gap-4">
          {image ? (
            <Image
              width={640}
              height={640}
              alt="이미지"
              src={image}
              className="flex-grow-0 flex-shrink-0 w-[120px] h-16 rounded-lg object-cover"
            />
          ) : (
            <div className="flex-grow-0 flex-shrink-0 w-[120px] h-16 rounded-lg bg-gray-200"></div>
          )}
          <div className="flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 relative gap-3.5">
            <p className="flex flex-shrink-0 w-[406px] text-base font-medium text-left text-[#121212]">{headLine}</p>
            <div className="flex justify-start items-start flex-grow-0 flex-shrink-0 relative gap-2">
              <p className="flex-grow-0 flex-shrink-0 text-[13px] text-left text-[#575757]">{relativeTimeString}</p>
              <p className="flex-grow-0 flex-shrink-0 text-[13px] text-left text-[#575757]">∙</p>
              <p className="flex-grow-0 flex-shrink-0 text-[13px] text-left text-[#575757]">{media}</p>
            </div>
          </div>
        </div>
      </Link>
    </>
  );
}
