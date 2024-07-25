"use client";
import BodyFont from "@/common/BodyFont";
import TextButton from "@/common/TextButton";
import ProfileSVG from "/public/images/profile_sm.svg";
import { useEffect, useState } from "react";
import ProfileEdit from "./_components/ProfileEdit";
import AccountSetting from "./_components/AccountSettings";
import SideBar from "../_components/SideBar";
import { TUser } from "@/app/api/profile/route";
import loadingSpinner from "/public/images/loading/loadingSpiner.gif";
import Image from "next/image";
import AccountInfoBox from "./_components/AccountInfoBox";
import { BASE_URL } from "@/constants";

type TprofilePage = {
  userId?: string;
  userData?: TUser;
};

export default function ProfilePage({ userData }: TprofilePage) {
  const [isProfileModalOpened, setProfileModalOpened] = useState(false);
  const [isAccountModalOpened, setAccountModalOpened] = useState(false);
  const [profileData, setProfileData] = useState<TUser>();
  // const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (userData) setProfileData(userData);
  }, [userData]);

  // // 유저 기본 정보 가져오기
  // useEffect(() => {
  //   fetch(`${BASE_URL}/api/profile`, {
  //     method: "POST",
  //     body: JSON.stringify({ uid: userId }),
  //   })
  //     .then((r) => r.json())
  //     .then((result) => {
  //       console.log(result);
  //       setProfileData(result.data);
  //       setIsLoading(false);
  //     })
  //     .catch((error) => {
  //       console.error("에러발생:", error);
  //       setIsLoading(false);
  //     });
  // }, [userId]);

  return (
    <div className=" w-[1200px] min-h-[720px] flex gap-[27px] mt-[20px] mb-[112px]">
      {/* 사이드바 */}
      <SideBar menu="profile" />
      {/* 우측 영역 */}
      <div className="w-[888px] h-[720px] bg-grayscale-0 rounded-[16px] p-[32px]">
        <>
          <div className="w-full h-[388px] ">
            <div className="w-full h-[140px]  ">
              <div className="w-full h-[60px]  flex justify-between items-center">
                <div className="h-full w-[483px] ">
                  <BodyFont level="2" weight="bold" className="text-primary-900">
                    프로필 설정
                  </BodyFont>
                  <BodyFont level="4" weight="regular" className="text-grayscale-900 mt-2">
                    서비스 사용시 보여지는 프로필을 생성 및 변경합니다. 프로필을 설정해보세요.
                  </BodyFont>
                </div>
                <TextButton
                  variant="primary"
                  size="sm"
                  className="!w-[160px]"
                  onClick={(e) => {
                    setProfileModalOpened(!isProfileModalOpened);
                  }}
                >
                  프로필 수정
                </TextButton>
              </div>
              <div className=" w-[754px] h-[56px]  mt-6 flex justify-between gap-[122px]">
                <p className="text-base">프로필</p>
                <div className="w-[590px] h-[56px] flex justify-between gap-4 items-center">
                  {profileData ? (
                    profileData.image != "" ? (
                      <Image alt="" src={profileData.image} width={56} height={56} />
                    ) : (
                      <ProfileSVG width="56px" height="56px" />
                    )
                  ) : (
                    <ProfileSVG width="56px" height="56px" />
                  )}
                  <div className="w-[518px]">
                    <BodyFont level="4" weight="medium">
                      {profileData?.nick}
                    </BodyFont>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full h-[140px]   mt-8">
              <div className="w-full h-[60px]  flex justify-between items-center">
                <div className="h-full w-auto ">
                  <BodyFont level="2" weight="bold" className="text-primary-900">
                    계정 설정
                  </BodyFont>
                  <BodyFont level="4" weight="regular" className="text-grayscale-900 mt-2">
                    서비스 이용시 사용되는 계정을 생성 및 변경합니다. 계정을 연동하여 다양한 서비스를 이용해보세요.
                  </BodyFont>
                </div>
                <TextButton
                  variant="primary"
                  size="sm"
                  className="!w-[160px]"
                  onClick={() => {
                    setAccountModalOpened(!isAccountModalOpened);
                  }}
                >
                  계정정보 수정
                </TextButton>
              </div>
              <div className="pt-6">
                <AccountInfoBox title={"이름"} info={profileData?.name} />
                {profileData?.accountType != "K" && <AccountInfoBox title={"아이디"} info={profileData?.userId} />}
                <AccountInfoBox title={"생년월일"} info={profileData?.birthdate} />
              </div>
            </div>
          </div>
        </>
      </div>
      {isProfileModalOpened && (
        <ProfileEdit
          onClose={() => setProfileModalOpened(false)}
          profileData={{ profileData, setProfileData }}
          userId={userData ? userData.userId : "UserId"}
        />
      )}
      {isAccountModalOpened && (
        <AccountSetting onClose={() => setAccountModalOpened(false)} profileData={{ profileData, setProfileData }} />
      )}
    </div>
  );
}
