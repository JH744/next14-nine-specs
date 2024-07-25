"use server";
import { firestore } from "@/firebase/firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getStockByKeyword, TStocks } from "../profile/useStocksHandler";
import { NewsResponse } from "@/types/news";
type TstockInfoList = {
  ticker: string;
  name: string;
  code: string;
}[];
export async function searchAction(formData: FormData) {
  const keyword = formData.get("keyword") as string;
  console.log("전달받은 데이터:" + keyword);
  await AddSearchCount(keyword); // 검색카운트 +1
  redirect(`/discovery/${encodeURIComponent(keyword)}`); // 페이지이동
}

/**    // 주식종목명 = keyword인 주식종목의 searchCount +1 */
export async function AddSearchCount(keyword: string) {
  try {
    const stocksRef = collection(firestore, "stocks");
    const q = query(stocksRef, where("stockName", "==", keyword), limit(1));
    const querySnapshot = await getDocs(q);
    const doc = querySnapshot.docs[0];

    if (doc) {
      await updateDoc(doc.ref, {
        searchCount: increment(1),
      });
    } else {
      console.log("해당 주식 종목을 찾을 수 없습니다.");
    }
  } catch (error) {
    console.log("에러 발생:", error);
  }
}

/**주식명과 일치하는 모든 주식데이터가져오기 */
export async function stockListByStockName(stockNameList: string[]) {
  try {
    const stocksRef = collection(firestore, "stocks");
    const q = query(stocksRef, where("stockName", "in", stockNameList));
    const querySnapshot = await getDocs(q);

    // 데이터를 담을 배열
    const stocksData: TStocks[] = [];

    // 각 문서 데이터를 배열에 추가
    querySnapshot.forEach((doc) => {
      stocksData.push(doc.data() as TStocks);
    });

    const stockInfo: TstockInfoList = stocksData.map((item) => ({
      ticker: item.stockCode,
      name: item.stockName,
      code: item.stockCode,
    }));

    console.log("stockInfo Data:", stockInfo);
    return stockInfo; // 데이터를 반환하도록 수정
  } catch (error) {
    console.log("에러 발생:", error);
  }
}
/**검색 종목의 관련뉴스가져오기 */
export async function getRelatedStockNews(stockId: string) {
  try {
    console.log("가져온 stockId:" + stockId);
    const userStocksCollectionRef = collection(firestore, `news/stockWorldNews/articles`);
    // const q = query(userStocksCollectionRef, where("relatedStocks", "==", stockId), limit(20)); // AMZN 또는 GOOGL , MSFT
    const q = query(userStocksCollectionRef, where("relatedStocks", "array-contains", stockId), limit(20)); // AMZN 또는 GOOGL// 필드값 배열조회
    // 쿼리 실행
    const querySnapshot = await getDocs(q);
    console.log("querySnapshot" + querySnapshot);

    const newsList: NewsResponse[] = [];

    querySnapshot.forEach((doc) => {
      newsList.push(doc.data() as NewsResponse);
      console.log("ddd" + doc.data);
    });
    console.log("가져온 뉴스 데이터" + newsList);
    return newsList;
  } catch (e) {
    console.error;
  }
}
