/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { PRICE_SUFFIX } from "@/src/data/landing";
import { Button } from "@/src/elements/ui/button";
import { useAppSelector } from "@/src/redux/hooks";
import CurrencyValue from "@/src/shared/CurrencyValue";
import { Plan } from "@/src/types/subscription";
import { isFeaturePlatformAllowed } from "@/src/utils";
import { ArrowRight, Check, ChevronDown, ChevronUp, Crown, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * In-app plan comparison (Billing & Plans), styled like the public pricing page:
 * plans as columns, features as rows, Choose Plan at the bottom.
 */
interface PlanComparisonTableProps {
  plans: Plan[];
  billingTab: string;
  activePlanId?: string;
  isFreeTrial?: boolean;
  onSubscribe: (plan: Plan) => void;
}

const DEFAULT_VISIBLE = 10;

const BOOLEAN_KEYS = ["rest_api", "whatsapp_webhook", "auto_replies", "analytics", "priority_support", "free_trial"];
const isBooleanKey = (key: string) => BOOLEAN_KEYS.includes(key) || /^(omnichannel_|fb_|ig_|tg_|tw_)/.test(key);

const headerPill = (idx: number, name: string, featured: boolean) => {
  const n = name.toLowerCase();
  if (featured) return "bg-sky-500 text-white shadow-sky-500/20";
  if (n.includes("enterprise") || n.includes("ultimate") || idx === 2) return "bg-amber-500 text-white shadow-amber-500/25";
  return "bg-primary text-white shadow-primary/20";
};

const PlanComparisonTable = ({ plans, billingTab, activePlanId, isFreeTrial, onSubscribe }: PlanComparisonTableProps) => {
  const { t } = useTranslation();
  const { setting } = useAppSelector((state: any) => state.setting);
  const [isExpanded, setIsExpanded] = useState(false);

  const rows = useMemo(
    () =>
      plans.map((plan: any) => ({
        plan,
        features: Object.entries(plan.features || {})
          .filter(([key]) => !["_id", "id", "__v"].includes(key) && isFeaturePlatformAllowed(key, setting?.omnichannel_platforms))
          .map(([key, value]) => ({ key, label: t(`plan_features_${key}`, key.replace(/_/g, " ")) as string, value })),
        enabled: plan.enabled_features || {},
      })),
    [plans, setting?.omnichannel_platforms, t],
  );

  const featureInfo = (row: (typeof rows)[number], label: string) => {
    const f = row.features.find((x) => x.label === label);
    if (!f) return { value: undefined as any, disabled: true };
    let disabled = row.enabled && f.key in row.enabled && !row.enabled[f.key];
    let value: any = f.value;
    if (value === false) disabled = true;
    else if (value === 0 || value === "0" || (typeof value === "number" && value <= 0)) {
      if (isBooleanKey(f.key)) disabled = true;
      else value = "Unlimited";
    }
    return { value, disabled };
  };

  // Unlimited rows first, then numbers, then ticks, then all-crosses; alphabetical within each.
  const rank = (label: string) => {
    let best = 4;
    for (const row of rows) {
      const { value, disabled } = featureInfo(row, label);
      if (disabled) continue;
      if (String(value).toLowerCase() === "unlimited") best = Math.min(best, 1);
      else if (typeof value === "number" || (!isNaN(Number(value)) && typeof value !== "boolean")) best = Math.min(best, 2);
      else best = Math.min(best, 3);
    }
    return best;
  };
  const labels = Array.from(new Set(rows.flatMap((r) => r.features.map((f) => f.label)))).sort(
    (a, b) => rank(a) - rank(b) || a.localeCompare(b),
  );
  const visibleLabels = isExpanded ? labels : labels.slice(0, DEFAULT_VISIBLE);

  const featuredCount = plans.filter((p: any) => p.is_featured).length;
  const highlighted = featuredCount === 1 ? plans.findIndex((p: any) => p.is_featured) : -1;

  const renderValue = (value: any, disabled: boolean) => {
    if (disabled || value === false)
      return (
        <span className="bg-rose-100 dark:bg-rose-500/15 text-rose-600 p-1.5 rounded-full inline-flex">
          <X size={14} />
        </span>
      );
    if (value === true || value === "Yes" || value === "yes")
      return (
        <span className="bg-primary/10 text-primary p-1.5 rounded-full inline-flex">
          <Check size={14} />
        </span>
      );
    if (value === null || value === undefined) return <span className="text-slate-400 font-semibold">—</span>;
    return <span className="text-sm font-bold text-slate-800 dark:text-white">{String(value)}</span>;
  };

  if (plans.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto table-custom-scrollbar rounded-lg border border-slate-200 dark:border-(--card-border-color) bg-white dark:bg-(--card-color) shadow-sm">
      <table className="w-full border-collapse min-w-max text-left">
        <thead>
          <tr className="border-b border-slate-200 dark:border-(--card-border-color)">
            <th className="p-4 md:p-6 min-w-[140px] md:min-w-[230px] bg-slate-50 dark:bg-(--page-body-bg) font-black text-slate-800 dark:text-white text-xs md:text-base sticky left-0 z-20">
              Features Comparison
            </th>
            {rows.map(({ plan }: any, idx) => {
              const isCurrent = activePlanId && String(plan._id) === String(activePlanId);
              const featured = idx === highlighted;
              return (
                <th key={plan._id} className="p-4 md:p-6 min-w-[220px] md:min-w-[250px] text-center border-r border-slate-200! dark:border-(--card-border-color)! last:border-r-0 align-top">
                  <div className="flex flex-col items-center">
                    <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                      {plan.name}
                      {featured && (
                        <span className="inline-flex items-center justify-center bg-amber-500 w-5 h-5 rounded-full" title="Most Popular">
                          <Crown size={11} className="fill-white text-white" />
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold line-clamp-2 max-w-[220px] whitespace-normal mb-4 min-h-8">{plan.description || ""}</p>
                    <div className={`inline-flex items-center gap-1.5 py-2.5 px-6 rounded-lg text-base font-extrabold shadow-lg ${headerPill(idx, plan.name, featured)}`}>
                      <CurrencyValue amount={plan.price} fromCode={plan.currency?.code} className="font-black text-white" fallbackSymbol={plan.currency?.symbol} />
                      <span className="text-xs opacity-90 font-bold">{PRICE_SUFFIX[String(billingTab).toLowerCase()] || ""}</span>
                    </div>
                    {isCurrent && <span className="mt-3 text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">Current Plan</span>}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {visibleLabels.map((label) => (
            <tr key={label} className="border-b border-slate-200 dark:border-(--card-border-color) hover:bg-slate-50/40 dark:hover:bg-(--table-hover)">
              <td className="p-3 md:p-4 bg-slate-50 dark:bg-(--page-body-bg) font-bold text-slate-700 dark:text-slate-300 text-xs md:text-sm border-r border-slate-200 dark:border-(--card-border-color) capitalize sticky left-0 z-10">
                {label}
              </td>
              {rows.map((row: any) => {
                const { value, disabled } = featureInfo(row, label);
                return (
                  <td key={row.plan._id} className="p-3 md:p-4 text-center border-r border-slate-200 dark:border-(--card-border-color) last:border-r-0">
                    {renderValue(value, disabled)}
                  </td>
                );
              })}
            </tr>
          ))}

          {labels.length > DEFAULT_VISIBLE && (
            <tr className="border-b border-slate-200 dark:border-(--card-border-color)">
              <td colSpan={rows.length + 1} className="py-3 relative">
                <div className="sticky left-1/2 -translate-x-1/2 w-max inline-block">
                  <Button
                    variant="ghost"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="inline-flex items-center gap-2 text-sm font-bold text-primary bg-primary/5 hover:bg-primary/10 px-5 h-9 rounded-full"
                  >
                    {isExpanded ? "View Less" : `View More (${labels.length - DEFAULT_VISIBLE} more features)`}
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </Button>
                </div>
              </td>
            </tr>
          )}

          <tr>
            <td className="p-4 md:p-6 border-r border-slate-200 dark:border-(--card-border-color) bg-slate-50 dark:bg-(--page-body-bg) sticky left-0 z-10" />
            {rows.map(({ plan }: any) => {
              const isCurrent = activePlanId && String(plan._id) === String(activePlanId);
              const hideButton = isFreeTrial && plan.price === 0;
              return (
                <td key={plan._id} className="p-4 md:p-6 text-center border-r border-slate-200 dark:border-(--card-border-color) last:border-r-0">
                  {!hideButton && (
                    <Button
                      variant="outline"
                      disabled={!!isCurrent}
                      onClick={() => onSubscribe(plan)}
                      className="group inline-flex items-center justify-between gap-5 border-slate-200 dark:border-(--card-border-color) hover:border-primary font-extrabold text-sm h-11 pl-5 pr-1.5 rounded-lg disabled:opacity-60"
                    >
                      <span>{isCurrent ? "Current Plan" : "Choose Plan"}</span>
                      {!isCurrent && (
                        <span className="bg-primary text-white w-8 h-8 rounded-lg flex items-center justify-center">
                          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      )}
                    </Button>
                  )}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PlanComparisonTable;
