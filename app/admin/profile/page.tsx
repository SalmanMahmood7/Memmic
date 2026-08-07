"use client"
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
// import { headers } from "next/headers";
import Image from "next/image";
import { CameraIcon } from "./_components/icons";
import { SocialAccounts } from "./_components/social-accounts";
import { useEffect, useState } from "react";
import { ApiError, getUserProfile, UserMe } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { DashboardLayout } from "@/components/Layouts/dashboard-layout";


export default function Page() {
  
    const [profile, setProfile] = useState<UserMe | null>(null);
    const [error, setError] = useState('');
    const [profileLoading, setProfileLoading] = useState(true);
    const {token, isLoading} = useAuth()

    useEffect(() => {
    if (isLoading || !token) return;

    getUserProfile(token)
      .then(setProfile)
      .catch((err) => {
        console.error('Profile fetch failed:', err);
        setError(err instanceof ApiError ? err.message : 'Could not load your profile.');
      })
      .finally(() => setProfileLoading(false));
  }, [token, isLoading])

  

  return (
    <DashboardLayout>
    <div className="mx-auto w-full max-w-242.5">
      {/* <Breadcrumb pageName="Profile" /> */}

      <div className="overflow-hidden rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="relative z-20 h-35 md:h-65">
          {/* <Image
            src={profile.coverPhoto}
            alt="profile cover"
            className="h-full w-full rounded-tl-[10px] rounded-tr-[10px] object-cover object-center"
            width={970}
            height={260}
            style={{
              width: "auto",
              height: "auto",
            }}
          />*/}
          {/* <div className="absolute right-1 bottom-1 z-10 xsm:right-4 xsm:bottom-4">
            <label
              htmlFor="cover"
              className="hover:bg-opacity-90 flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-3.75 py-1.25 text-body-sm font-medium text-white"
            >
              <input
                type="file"
                name="coverPhoto"
                id="coverPhoto"
                className="sr-only"
                accept="image/png, image/jpg, image/jpeg"
              />

              <CameraIcon />

              <span>Edit</span>
            </label>
          </div> */}
        </div>
        <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
          {/* <ProfileImageUploader
            initialImage={profile.profilePhoto}
            name={profile?.full_name}
          /> */}
          <div className="mt-4">
            <h3 className="mb-1 text-heading-6 font-bold text-dark dark:text-white">
              {profile?.full_name}
            </h3>
            {/* <p className="font-medium">{profile.role}</p> */}
            {/* <div className="mx-auto mt-5 mb-5.5 grid max-w-92.5 grid-cols-3 rounded-[5px] border border-stroke py-2.25 shadow-1 dark:border-dark-3 dark:bg-dark-2 dark:shadow-card">
              <div className="flex flex-col items-center justify-center gap-1 border-r border-stroke px-4 xsm:flex-row dark:border-dark-3">
                <span className="font-medium text-dark dark:text-white">
                  259
                </span>
                <span className="text-body-sm">Posts</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 border-r border-stroke px-4 xsm:flex-row dark:border-dark-3">
                <span className="font-medium text-dark dark:text-white">
                  129K
                </span>
                <span className="text-body-sm">Followers</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 px-4 xsm:flex-row">
                <span className="font-medium text-dark dark:text-white">
                  2K
                </span>
                <span className="text-body-sm-sm">Following</span>
              </div>
            </div> */}

            {/* <div className="mx-auto max-w-180">
              <h4 className="font-medium text-dark dark:text-white">
                About Me
              </h4>
              <p className="mt-4">{profile.bio}</p>
            </div> */}

            {/* <SocialAccounts /> */}
          </div>
        </div>
      </div>
    </div>

    </DashboardLayout>
  );
}
