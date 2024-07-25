import React from "react";
import BodyFont from "@/common/BodyFont";
import ButtonFont from "@/common/ButtonFont";
import NotFoundIcon from "/public/images/Not_found_icon.svg";
import SearchInput from "../_components/SearchInput";
import { getStockByKeyword, TStocks } from "@/hooks/profile/useStocksHandler";
import { TstockInfoList } from "../../favorite/_components/FavoriteStockLists";
import StockItem from "@/common/StockItem/StockItem";
import Link from "next/link";
import { getRelatedStockNews } from "@/hooks/discovery/useSearchAction";
import RecentStockNewsItem from "./_components/RecentStockNewsItem";
import { NewsResponse } from "@/types/news";
import DiscoveryNeswTap from "./_components/DiscoveryNeswTap";

type TProps = {
  params: {
    searchedId: string;
  };
};
type TsearchStockList =
  | {
      word: string;
    }[]
  | null;
export default async function Page({ params }: TProps) {
  const { searchedId } = params;
  const decodedKeyword = decodeURIComponent(searchedId);
  const fetchStocks = async () => {
    return await getStockByKeyword(decodedKeyword);
  };
  const stockdata: TStocks[] = await fetchStocks();

  let stockInfoList: TstockInfoList = [];
  // 타입 변환
  stockInfoList.push({
    ticker: stockdata[0].stockId,
    name: stockdata[0].stockName,
    code: stockdata[0].stockCode,
  });

  const relatedNews: NewsResponse[] = (await getRelatedStockNews(stockInfoList[0].ticker)) || [];

  return (
    <>
      <div className="w-[590px] h-[896px] flex flex-col relative gap-8 mx-auto mt-[56px]">
        <SearchInput />
        {/* 주식탭 */}
        <div className="w-[590px] h-auto flex flex-col">
          <div className="w-[590px] h-[32px] mb-2 flex gap-4">
            <BodyFont level="1" weight="bold" className="text-primary-900">
              주식
            </BodyFont>
            <ButtonFont weight="medium" className="border-none text-[#575757] underline !text-[14px] !leading-[20px]">
              ({stockInfoList.length})
            </ButtonFont>
          </div>
          <div className="w-full h-auto rounded-lg bg-grayscale-0 p-6 flex flex-col gap-[10px]">
            {stockInfoList ? (
              <div>
                <div className="w-[542px] h-[208px]">
                  {/* 여기 데이터 */}

                  {stockInfoList.map((a, index) => (
                    <div key={index} className="w-[264px]">
                      <Link href={`/report/${decodedKeyword}`} className="w-full">
                        <StockItem {...a} size="md" />
                      </Link>
                    </div>
                  ))}
                </div>
                <div className="mt-2 w-[542px] h-[40px] border-t border-gray-300 pt-4 px-[10px] text-center cursor-pointer">
                  더보기
                </div>
              </div>
            ) : (
              <div className="w-[542px] h-[208px] border flex flex-col items-center justify-center gap-[13px] ">
                <NotFoundIcon />
                <BodyFont level="2" weight="regular" className="text-primary-900">
                  조회된 검색결과가 없습니다.
                </BodyFont>
              </div>
            )}
          </div>
        </div>
        <div>
          {/* 뉴스탭 */}
          {/* <DiscoveryNeswTap relatedNews={relatedNews} /> */}
        </div>
      </div>
    </>
  );
}
