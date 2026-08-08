"use client";

import { ChevronUpIcon } from "@/assets/icons";
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
// import { signOut, useSession } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LogOutIcon, SettingsIcon, UserIcon } from "./icons";
import { useAuth } from "@/context/AuthContext";
import { ApiError, getClientPortalProfile, getUserProfile } from "@/lib/api";

const PORTAL_ROLES = ["evaluation_client", "investment_client", "marketplace_client", "management_client"];

export function UserInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { token, role, setToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{ full_name: string; email: string } | null>(null);
  const [profileError, setProfileError] = useState("");

  const normalizedRole = (role ?? "").toLowerCase();
  const isPortalUser = PORTAL_ROLES.includes(normalizedRole);
  const isAdmin = normalizedRole === "admin";
  const settingsHref = isPortalUser ? `/portal/${normalizedRole.replace("_client", "")}/settings` : "/admin/profile";

  async function handleLogout() {
    setIsOpen(false);
    const loadingId = toast.loading("Logging out...");

    try {
      setToken(null);
      router.push("/signin");
      toast.success("Logged out successfully", {id: loadingId});
    } catch {
      toast.error("Failed to log out", {id: loadingId});
    } finally {
      toast.dismiss(loadingId);
    }
  }

  useEffect(() => {
    if (!token) {
      return;
    }

    const request = isPortalUser
      ? getClientPortalProfile(token)
      : isAdmin
        ? getUserProfile(token)
        : null;

    if (!request) {
      setLoading(false);
      return;
    }

    request
      .then((profile) => {
        setUserProfile({ full_name: profile.full_name, email: profile.email });
        setProfileError("");
      })
      .catch((err) => {
        setProfileError(err instanceof ApiError ? err.message : "Could not load your profile.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token, isPortalUser, isAdmin]);


  if (loading) {
    return (
      <div className="flex items-center gap-3" role="presentation">
        <span className="inline-block size-12 animate-pulse rounded-full bg-gray-200" />

        <div className="relative h-7 w-fit">
          <span className="flex h-7 w-30 animate-pulse items-center justify-end rounded-full bg-gray-200 pr-2" />
          <ChevronUpIcon
            aria-hidden
            className="absolute top-1/2 right-2 -translate-y-1/2 rotate-180 text-gray-400/60"
            strokeWidth={1.5}
          />
        </div>
      </div>
    );
  }

  

  // const user = {
  //   name: session?.data?.user?.name as string,
  //   email: session?.data?.user?.email as string,
  //   img: session?.data?.user?.image as string,
  // };

  return (
    <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
      <DropdownTrigger className="cursor-pointer rounded align-middle ring-primary ring-offset-2 outline-none focus-visible:ring-1 dark:ring-offset-gray-dark">
        <span className="sr-only">My Account</span>

        <figure className="flex items-center gap-3">
          {/* {user?.img ? (
            <Image
              src={user.img}
              className="size-12 overflow-hidden rounded-full object-cover"
              alt={`Avatar of ${user.name}`}
              role="presentation"
              width={200}
              height={200}
            />
          ) : (
            <UserAvatar />
          )} */}
          <UserAvatar />
          <figcaption className="flex items-center gap-1 font-medium text-dark max-[1024px]:sr-only dark:text-dark-6">
            <span className="max-w-24 truncate">{userProfile?.full_name}</span>

            <ChevronUpIcon
              aria-hidden
              className={cn(
                "rotate-180 transition-transform",
                isOpen && "rotate-0",
              )}
              strokeWidth={1.5}
            />
          </figcaption>
        </figure>
      </DropdownTrigger>

      <DropdownContent
        className="border border-stroke bg-white shadow-md min-[230px]:min-w-70 dark:border-dark-3 dark:bg-gray-dark"
        align="end"
      >
        <h2 className="sr-only">User information</h2>

        <figure className="flex items-center gap-2.5 px-5 py-3.5">
          {/* {user?.img ? (
            <Image
              src={user.img}
              className="size-12 shrink-0 overflow-hidden rounded-full object-cover object-center"
              alt={`Avatar of ${user.name}`}
              role="presentation"
              width={48}
              height={48}
            />
          ) : (
            <UserAvatar />
          )} */}

          <UserAvatar />
            

          <figcaption className="space-y-1 text-base font-medium">
            <div className="mb-2 leading-none text-dark dark:text-white">
              {userProfile?.full_name}
            </div>

            <div className="w-full max-w-47.5 truncate leading-none text-gray-6">
              {userProfile?.email}
            </div>
          </figcaption>
        </figure>
        

        <hr className="border-[#E8E8E8] dark:border-dark-3" />

        <div className="p-2 text-base text-[#4B5563] *:cursor-pointer dark:text-dark-6">
          <Link
            href={settingsHref}
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.25 ring-primary outline-0 hover:bg-gray-2 hover:text-dark focus-visible:ring-1 dark:hover:bg-dark-3 dark:hover:text-white"
          >
            <UserIcon />

            <span className="mr-auto text-base font-medium">View profile</span>
          </Link>

          <Link
            href={settingsHref}
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.25 ring-primary outline-0 hover:bg-gray-2 hover:text-dark focus-visible:ring-1 dark:hover:bg-dark-3 dark:hover:text-white"
          >
            <SettingsIcon />

            <span className="mr-auto text-base font-medium">
              Account Settings
            </span>
          </Link>
        </div>

        <hr className="border-[#E8E8E8] dark:border-dark-3" />

        <div className="p-2 text-base text-[#4B5563] dark:text-dark-6">
          <button
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2.25 ring-primary outline-0 hover:bg-gray-2 hover:text-dark focus-visible:ring-1 dark:hover:bg-dark-3 dark:hover:text-white"
            onClick={handleLogout}
          >
            <LogOutIcon />

            <span className="text-base font-medium">Log out</span>
          </button>
        </div>
      </DropdownContent>
    </Dropdown>
  );
}

function UserAvatar() {
  return (
    <span className="flex size-12 items-center border-stroke justify-center rounded-full border bg-gray-2 text-dark outline-none dark:border-dark-4 dark:bg-dark-2 dark:text-white">
      <UserIcon />
    </span>
  );
}
