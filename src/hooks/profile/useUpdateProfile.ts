"use server";

import { firestore, storage } from "@/firebase/firebaseConfig";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, StorageReference, uploadBytes } from "firebase/storage";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TStocks } from "./useStocksHandler";
import { getSession } from "@/lib/getSession";
import { GetUser } from "./useGetUser";
import { TstockInfoList } from "@/app/(afterLogin)/favorite/_components/FavoriteStockLists";
import { updateData } from "@/components/Report/StockHeader/StockFavorButton";

//프로필 사진 , 닉네임 , 관심 종목 수정하기
export async function useUpdateProfile(formData: FormData) {
  const file = formData.get("file") as File | null;
  let nick = formData.get("nick") as string;
  let userId = formData.get("userId") as string;
  const previousNick = formData.get("previousNick") as string;
  const myStockStr = formData.get("myStock") as string | undefined;

  if (!nick) {
    nick = previousNick;
  }

  console.log("파일 이름:", file?.name);
  console.log("닉네임:", nick);
  console.log("관심종목:", myStockStr);

  let myStock: string[] = [];
  if (myStockStr != undefined) {
    myStock = myStockStr.split("#").join("").split(" ");
  }

  // 세션 또는 전역에서 회원정보가져오기
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }
  const uid = session?.user?.id;
  // users 컬렉션에서 uid일치하는 document가져오기
  const userDocRef = doc(firestore, "users", uid);

  if (file && file.size > 0) {
    try {
      // <<이미지파일 스토리지 저장>>
      // 파일이 null이 아니면 실행
      console.log("파일 있음");
      // 파일의 경로 및 파일명 설정
      // userProfile이라는 폴더를 만들고 그 뒤에 uid 경로

      const user = await GetUser();
      let locationRef: any = "";
      if (user?.accountType == "K") {
        locationRef = ref(storage, `userProfile/${user.id}`) as StorageReference;
      } else {
        locationRef = ref(storage, `userProfile/${user?.userId}`) as StorageReference;
      }
      // *참고* 위의 경로와 파일명과 동일한 파일이 있다면 덮어씀.
      // 스토리지에 파일 업로드. 성공 시 결과 반환
      const result = await uploadBytes(locationRef, file);
      // 반환값을 통해 저장된 파일의 URL 가져옴
      const url = await getDownloadURL(result.ref);
      console.log("파일 URL:", url);

      // <<DB에 프로필 사진의 URL과 닉네임 업데이트>>
      await updateDoc(userDocRef, {
        image: url,
        nick: nick,
      });
    } catch (error) {
      console.log("에러 발생:", error);
    }
  } else {
    console.log("파일이 없습니다.");
    // file이 없을 때는 닉네임과 관심 종목만 업데이트 진행
    await updateDoc(userDocRef, {
      nick: nick,
    });
  }

  // 관심 종목을 서브 콜렉션에 저장
  try {
    //주식데이터 가져오기
    const stocksRef = collection(firestore, "stocks");
    const q = query(stocksRef, where("stockName", "in", myStock));
    const querySnapshot = await getDocs(q);
    const stockList: TStocks[] = [];
    querySnapshot.forEach((doc) => {
      stockList.push(doc.data() as TStocks);
    });
    //서브콜렉션 참조
    const myStocksCollectionRef = collection(firestore, "users", uid, "myStocks");

    // 기존 서브 콜렉션의 모든 문서 삭제(수정할 때만 필요)
    const existingDocs = await getDocs(myStocksCollectionRef);
    const deletePromises = existingDocs.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // 새로운 관심 종목을 서브 콜렉션에 추가
    const addStockPromises = stockList.map(
      (stock) =>
        addDoc(myStocksCollectionRef, {
          stockName: stock.stockName,
          stockId: stock.stockId,
          // logoUrl: stockData.logoUrl, // 필요시 추가
          stockCode: stock.stockCode,
        }), // 자동 생성된 UID로 문서 추가
    );
    //조영님 관심종목 콜렉션 추가
    // let stockInfoList: TstockInfoList = [];
    // stockList.forEach((a, i) => {
    //   stockInfoList.push({
    //     ticker: a.stockId,
    //     name: a.stockName,
    //     code: a.stockCode,
    //   });
    // });
    // stockInfoList.forEach((a) => {
    //   updateData(userDocRef.id, a);
    // });
    //조영님 관심종목 콜렉션 추가 끝

    await Promise.all(addStockPromises);

    console.log("관심 종목 수정 완료");
  } catch (error) {
    console.log("관심 종목 수정 중 에러 발생:", error);
  } finally {
    revalidatePath("/mypage/profile");
  }
}

export async function updateLang(lang: string) {
  // 세션 또는 전역에서 회원정보가져오기
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }
  const uid = session?.user?.id;
  try {
    const userDocRef = doc(firestore, "users", uid);
    await updateDoc(userDocRef, {
      language: lang,
    });
  } catch (error) {
    console.log("언어설정 변경 중 에러 발생:", error);
  }
  console.log("언어변경완료");
}
