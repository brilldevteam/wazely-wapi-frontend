"use client";

import { Agent } from "@/src/types/components";
import { safeParseDate } from "@/src/utils/safeDate";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";

/**
 * Whether an agent can get new auto-assigned chats right now:
 * Available (online + available), Away (online, set to away) or Offline.
 */
const AgentAvailabilityBadge = ({ agent }: { agent: Agent }) => {
  const { t } = useTranslation();

  if (agent.status === false) {
    return <span className="text-xs font-semibold text-slate-400">{t("availability_inactive", "Inactive")}</span>;
  }

  if (agent.is_online && agent.availability_status !== "away") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 px-2.5 py-1 rounded-full">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        {t("availability_available", "Available")}
      </span>
    );
  }

  if (agent.is_online) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 px-2.5 py-1 rounded-full">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        {t("availability_away", "Away")}
      </span>
    );
  }

  const lastSeen = agent.last_seen ? safeParseDate(agent.last_seen) : null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-white/5 dark:text-slate-400 px-2.5 py-1 rounded-full w-fit">
        <span className="w-2 h-2 rounded-full bg-slate-400" />
        {t("availability_offline", "Offline")}
      </span>
      {lastSeen && (
        <span className="text-[11px] text-slate-400 pl-1">
          {t("availability_last_seen", "Last seen")} {formatDistanceToNow(lastSeen, { addSuffix: true })}
        </span>
      )}
    </div>
  );
};

export default AgentAvailabilityBadge;
