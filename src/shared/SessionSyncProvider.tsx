"use client";

import { useAppDispatch } from "@/src/redux/hooks";
import { setCredentials, stopLoading, updateUser } from "@/src/redux/reducers/authSlice";
import { User } from "@/src/types/auth";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ROUTES, isGuestPath } from "../constants";
import { useGetProfileQuery } from "../redux/api/authApi";
import { getUrlWithBasePath } from "../utils";
import { isLoggingOut, performLogout } from "../utils/logout";

const SessionSyncProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const { data: profileData } = useGetProfileQuery(undefined, {
    skip: status !== "authenticated",
  });

  useEffect(() => {
    if (status === "authenticated" && session) {
      // Map session data to User interface
      const userData: User = {
        id: session.user?.id || "",
        name: session.user?.name || session.user?.email?.split("@")[0] || "User",
        email: session.user?.email || "",
        role: session.user?.role || "user",
        avatar: session.user?.image || undefined,
        isSelfTenant: (session as { isSelfTenant?: boolean }).isSelfTenant,
      };

      dispatch(
        setCredentials({
          user: userData,
          token: session.accessToken || "",
        })
      );
    } else if (status === "unauthenticated") {
      dispatch(stopLoading());
    }
  }, [session, status, dispatch]);

  // Logged out in another tab (or the session ended): don't leave this tab on a
  // page that no longer works — finish the logout here too and show the login page.
  // next-auth also reports "unauthenticated" when a background session check fails
  // on a bad network, so confirm the session is really gone before logging out.
  const previousStatusRef = useRef(status);
  const pathnameRef = useRef(pathname);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const wasAuthenticated = previousStatusRef.current === "authenticated";
    previousStatusRef.current = status;

    if (!wasAuthenticated || status !== "unauthenticated" || isLoggingOut()) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      if (cancelled || isLoggingOut() || !navigator.onLine || isGuestPath(pathnameRef.current || "")) return;
      try {
        const res = await fetch(getUrlWithBasePath("/api/auth/session"), { cache: "no-store", credentials: "same-origin" });
        if (!res.ok) return; // server problem, not a logout
        const current = await res.json();
        if (!cancelled && !current?.user) performLogout(ROUTES.Login);
      } catch {
        // Network error: not a logout. The next successful session check restores the page.
      }
    }, 1500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [status]);

  useEffect(() => {
    if (profileData?.user) {
      dispatch(updateUser(profileData.user));
    }
  }, [profileData, dispatch]);

  return <>{children}</>;
};

export default SessionSyncProvider;