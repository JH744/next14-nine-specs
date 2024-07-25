"use server";
import { firestore } from "@/firebase/firebaseConfig";
import { collection, doc, getDoc, getDocs, limit, query, setDoc, updateDoc, where } from "firebase/firestore";
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
  console.log("서버액션실행-전달받은 데이터:" + keyword);

  // 현재 날짜를 "MM.DD" 형식으로 가져오기
  const today = new Date();
  const formattedDate = `${("0" + (today.getMonth() + 1)).slice(-2)}.${("0" + today.getDate()).slice(-2)}`;

  AddSearchCount(keyword); // 검색카운트 +1

  //주식종목의 uid를 넘길 예정
  redirect(`/discovery/${encodeURIComponent(keyword)}`);
  // revalidatePath(`/discovery/${keyword}`);
  // revalidatePath("/");
  // 5. keyword = 연관 종목인 뉴스 도커먼트 가져오기
  // 6. Keyword = 주식종목명인 주식종목 가져오기
}

/**    // 주식종목명 = keyword인 주식종목의 searchCount +1 */
export async function AddSearchCount(keyword: string) {
  try {
    const stocksRef = collection(firestore, "stocks");
    const q = query(stocksRef, where("stockName", "==", keyword));
    const querySnapshot = await getDocs(q);
    console.log("querySnapshot:" + querySnapshot.docs[0]);

    querySnapshot.forEach(async (doc) => {
      const stockData = doc.data();
      const newSearchCount = (stockData.searchCount || 0) + 1;

      await updateDoc(doc.ref, {
        searchCount: newSearchCount,
      });
    });
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
