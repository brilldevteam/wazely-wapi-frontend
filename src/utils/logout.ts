"use client";

import { ROUTES } from "@/src/constants";
import { signOut } from "next-auth/react";
import { getUrlWithBasePath } from "./index";

/** Browser-saved values that belong to the logged-in user and must not survive a logout. */
const USER_STORAGE_KEYS = ["selectedChat", "selectedPhoneNumberId", "selectedWorkspace", "announcement_popup_dismissed"];

const SERVER_LOGOUT_TIMEOUT_MS = 6000;
const SIGN_OUT_TIMEOUT_MS = 8000;

let logoutInProgress: Promise<void> | null = null;

let leavingToOtherApp = false;

/** True once a logout has started (or the page is leaving for another app); the page is about to unload. */
export const isLoggingOut = (): boolean => logoutInProgress !== null || leavingToOtherApp;

/**
 * Call before signing out to hand over to another app (e.g. back to the admin panel),
 * so this page doesn't treat the ended session as a logout and send the user to the login page.
 */
export const markLeavingToOtherApp = () => {
  leavingToOtherApp = true;
};

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T | undefined> =>
  new Promise((resolve) => {
    const timer = setTimeout(() => resolve(undefined), ms);
    promise
      .then((value) => resolve(value))
      .catch((error) => {
        console.error("Logout step failed:", error);
        resolve(undefined);
      })
      .finally(() => clearTimeout(timer));
  });

/** Ends the session on the API server so the token can't be used again. */
const endServerSession = () =>
  fetch(getUrlWithBasePath("/api/auth/logout"), {
    method: "POST",
    credentials: "same-origin",
    cache: "no-store",
  });

const clearUserStorage = () => {
  try {
    USER_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    localStorage.setItem("isRTL", "false");
  } catch {
    // Storage can be blocked (private mode); nothing else to clear then.
  }
};

/**
 * Logs the user out and loads the next page fresh.
 *
 * 1. Ends the session on the API server.
 * 2. Clears the browser login cookie (next-auth).
 * 3. Clears the user's saved browser values.
 * 4. Does a full page load to `redirectTo`, which also drops the live socket,
 *    open dialogs and all in-memory data. No manual refresh is ever needed.
 *
 * Safe to call many times at once: only the first call runs, the others wait on it.
 * Each step has a time limit, so a slow network can't leave the page stuck.
 */
export const performLogout = (redirectTo: string = ROUTES.Login): Promise<void> => {
  if (logoutInProgress) return logoutInProgress;

  logoutInProgress = (async () => {
    try {
      await withTimeout(endServerSession(), SERVER_LOGOUT_TIMEOUT_MS);
      await withTimeout(signOut({ redirect: false }), SIGN_OUT_TIMEOUT_MS);
    } finally {
      clearUserStorage();
      window.location.replace(getUrlWithBasePath(redirectTo));
    }
  })();

  return logoutInProgress;
};
