"use client";

import { useCallback, useMemo } from "react";
import { useAppSelector } from "@/src/redux/hooks";
import { useGetUserSubscriptionQuery } from "@/src/redux/api/subscriptionApi";
import { MENUITEMS } from "@/src/data/SidebarList";
import { ROUTES } from "@/src/constants";

export const useFeatureAccess = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { data: subscriptionRes, isLoading: subLoading } = useGetUserSubscriptionQuery(undefined, {
    skip: !isAuthenticated,
  });

  const enabledFeatures = useMemo(() => {
    if (!subscriptionRes?.success) return null;
    const sub = subscriptionRes.data;
    if (sub?.enabled_features && Object.keys(sub.enabled_features).length > 0) {
      return { ...sub.enabled_features };
    }
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...((sub?.plan_id as any)?.enabled_features || {}),
    };
  }, [subscriptionRes]);

  const planFeatures = useMemo(() => {
    if (!subscriptionRes?.success) return null;
    const sub = subscriptionRes.data;
    if (sub?.features && Object.keys(sub.features).length > 0) {
      return { ...sub.features };
    }
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...((sub?.plan_id as any)?.features || {}),
    };
  }, [subscriptionRes]);

  const isFeatureEnabled = useCallback(
    (featureKey?: string) => {
      if (user?.isSelfTenant) return true;
      if (!featureKey) return true;
      if (subLoading) return true;

      // Facebook specific sub-features check (requires omnichannel_facebook)
      if (
        (featureKey === "facebookAds_campaign" || featureKey === "facebook_lead") &&
        planFeatures &&
        planFeatures["omnichannel_facebook"] === false
      ) {
        return false;
      }
      
      // Check merged enabled_features map first
      if (enabledFeatures && enabledFeatures[featureKey] === false) return false;
      
      // Check features map next (handling boolean plan toggles)
      if (planFeatures && planFeatures[featureKey] === false) return false;
      if (planFeatures && planFeatures[featureKey] === true) return true;
      if (planFeatures && typeof planFeatures[featureKey] === 'number') return true;
      
      if (enabledFeatures && enabledFeatures[featureKey] === true) return true;
      
      // Feature is undefined in the user's snapshot
      return false;
    },
    [enabledFeatures, planFeatures, subLoading, user?.isSelfTenant]
  );

  const getEnabledChannels = useCallback(() => {
    if (user?.isSelfTenant) {
      return { facebook: true, instagram: true, telegram: true, twitter: true, whatsapp: true };
    }
    if (subLoading) {
      return { facebook: true, instagram: true, telegram: true, twitter: true, whatsapp: true };
    }

    const checkEnabled = (key: string) => {
      if (!planFeatures && !enabledFeatures) return true;
      const inPlan = planFeatures ? (planFeatures[key] === true || planFeatures[key] === "true") : false;
      const inEnabled = enabledFeatures ? (enabledFeatures[key] === true || enabledFeatures[key] === "true") : false;
      return inPlan || inEnabled;
    };

    return {
      facebook: checkEnabled("omnichannel_facebook"),
      instagram: checkEnabled("omnichannel_instagram"),
      telegram: checkEnabled("omnichannel_telegram"),
      twitter: checkEnabled("omnichannel_twitter"),
      whatsapp: true,
    };
  }, [planFeatures, enabledFeatures, subLoading, user?.isSelfTenant]);

  const isPathEnabled = useCallback(
    (path: string) => {
      const item = MENUITEMS.find((m) => m.path === path || path.startsWith(m.path + "/"));
      if (!item) return true;

      const enabled = getEnabledChannels();
      if (item.section === "telegram_sidebar_title") {
        if (!enabled.telegram) return false;
      }
      if (item.section === "facebook_sidebar_title") {
        if (!enabled.facebook) return false;
        if (item.path === ROUTES.FacebookLead && !isFeatureEnabled("facebook_lead")) return false;
      }
      if (item.section === "instagram_sidebar_title") {
        if (!enabled.instagram) return false;
      }

      if (!item.featureKey) return true;
      return isFeatureEnabled(item.featureKey);
    },
    [isFeatureEnabled, getEnabledChannels]
  );

  return { isFeatureEnabled, isPathEnabled, enabledFeatures, planFeatures, getEnabledChannels, isLoading: subLoading };
};
