"use client";

import "@/src/lib/i18n";
import { ReactNode, useEffect } from "react";
import { useAppSelector } from "../redux/hooks";
import { useLanguageInitializer } from "../hooks/useLanguageInitializer";
import Loading from "./loading";

import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";

const I18nProvider = ({ children }: { children: ReactNode }) => {
  const { isRTL } = useAppSelector((state) => state.layout);
  const isLanguageReady = useLanguageInitializer();
  const pathname = usePathname();
  const { i18n } = useTranslation();
  const locale = i18n.language || "en";

  useEffect(() => {
    const isAuthPage = pathname?.startsWith("/auth") && pathname !== "/auth/login";
    document.documentElement.lang = locale;
    const isLandingPage = pathname === "/" || pathname === "/landing";
    const isIntegrationToolsPage = pathname?.startsWith("/integration_tools");

    if (isAuthPage || isLandingPage || isIntegrationToolsPage) {
      document.documentElement.dir = "ltr";
      document.documentElement.classList.remove("rtl");
    } else {
      document.documentElement.dir = isRTL ? "rtl" : "ltr";
      if (isRTL) {
        document.documentElement.classList.add("rtl");
      } else {
        document.documentElement.classList.remove("rtl");
      }
    }
  }, [isRTL, pathname, locale]);

  if (!isLanguageReady) {
    return <Loading />;
  }

  return <>{children}</>;
};

export default I18nProvider;
