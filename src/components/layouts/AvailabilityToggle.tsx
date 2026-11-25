"use client";

import { Button } from "@/src/elements/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/src/elements/ui/dropdown-menu";
import { useGetAvailabilityQuery, useUpdateAvailabilityMutation } from "@/src/redux/api/authApi";
import { useAppSelector } from "@/src/redux/hooks";
import { AvailabilityStatus } from "@/src/types/components";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const OPTIONS: { value: AvailabilityStatus; dot: string; labelKey: string; label: string; hintKey: string; hint: string }[] = [
  {
    value: "available",
    dot: "bg-emerald-500",
    labelKey: "availability_available",
    label: "Available",
    hintKey: "availability_available_hint",
    hint: "You can get new chats automatically.",
  },
  {
    value: "away",
    dot: "bg-amber-500",
    labelKey: "availability_away",
    label: "Away",
    hintKey: "availability_away_hint",
    hint: "No new chats are auto-assigned to you. Your current chats stay with you.",
  },
];

/**
 * Header switch for the user's own status. Auto-assignment only gives new chats
 * to people who are online (CRM open) and set to Available.
 */
const AvailabilityToggle = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { data, isLoading } = useGetAvailabilityQuery(undefined, { skip: !isAuthenticated });
  const [updateAvailability, { isLoading: isSaving }] = useUpdateAvailabilityMutation();

  if (!isAuthenticated) return null;

  const current: AvailabilityStatus = data?.data?.availability_status || "available";
  const currentOption = OPTIONS.find((o) => o.value === current) || OPTIONS[0];

  const handleSelect = async (value: AvailabilityStatus) => {
    if (value === current || isSaving) return;
    try {
      const res = await updateAvailability({ availability_status: value }).unwrap();
      toast.success(res?.message || t(OPTIONS.find((o) => o.value === value)!.labelKey, OPTIONS.find((o) => o.value === value)!.label));
    } catch (error: unknown) {
      const message = (error as { data?: { message?: string } })?.data?.message;
      toast.error(message || t("availability_update_failed", "Could not change your status. Please try again."));
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          disabled={isLoading}
          title={t("availability_title", "Your status for new chats")}
          className="flex items-center gap-2 h-9 sm:h-10 px-2 sm:px-3 rounded-lg text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:bg-(--page-body-bg) dark:hover:bg-(--table-hover) text-sm font-medium border border-slate-200 dark:border-(--card-border-color) shadow-sm"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <span className={`w-2.5 h-2.5 rounded-full ${currentOption.dot} ring-2 ring-white dark:ring-(--card-color)`} />}
          <span className="hidden sm:inline">{t(currentOption.labelKey, currentOption.label)}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-72 bg-white dark:bg-(--card-color) border border-gray-200 dark:border-(--card-border-color) shadow-xl rounded-lg p-1.5">
        <p className="px-2.5 pt-1.5 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t("availability_title", "Your status for new chats")}</p>
        {OPTIONS.map((option) => (
          <DropdownMenuItem key={option.value} onSelect={() => handleSelect(option.value)} className="flex items-start gap-3 px-2.5 py-2 rounded-md cursor-pointer dark:hover:bg-(--table-hover)">
            <span className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${option.dot}`} />
            <span className="flex-1">
              <span className="block text-sm font-semibold text-slate-800 dark:text-gray-200">{t(option.labelKey, option.label)}</span>
              <span className="block text-xs text-slate-500 dark:text-gray-500 leading-snug">{t(option.hintKey, option.hint)}</span>
            </span>
            {option.value === current && <Check size={16} className="mt-1 text-primary shrink-0" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AvailabilityToggle;
