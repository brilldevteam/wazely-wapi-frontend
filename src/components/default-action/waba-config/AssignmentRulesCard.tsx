"use client";

import { Input } from "@/src/elements/ui/input";
import { cn } from "@/src/lib/utils";
import { Clock, UsersRound } from "lucide-react";
import React, { useState } from "react";
import ToggleSwitch from "./ToggleSwitch";

export const WAIT_HOURS_MIN = 1;
export const WAIT_HOURS_MAX = 168;
export const MAX_CHATS_MIN = 1;
export const MAX_CHATS_MAX = 1000;
export const DEFAULT_WAIT_HOURS = 6;
export const DEFAULT_MAX_CHATS = 10;

interface AssignmentRulesCardProps {
  queueEnabled: boolean;
  waitHours: number;
  maxOpenChats: number; // 0 = no limit
  disabled?: boolean;
  onChange: (changes: { assignment_queue_enabled?: boolean; assignment_wait_hours?: number; max_open_chats_per_agent?: number }) => void;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** A whole-number box that only reports valid values; it corrects itself when the user leaves it. */
const NumberBox = ({ value, min, max, disabled, onCommit, ariaLabel }: { value: number; min: number; max: number; disabled?: boolean; onCommit: (n: number) => void; ariaLabel: string }) => {
  const [text, setText] = useState(String(value));
  // Follow outside changes (e.g. Discard) without an effect.
  const [shownValue, setShownValue] = useState(value);
  if (value !== shownValue) {
    setShownValue(value);
    setText(String(value));
  }

  const commit = (raw: string) => {
    const n = parseInt(raw, 10);
    const next = Number.isFinite(n) ? clamp(n, min, max) : value;
    setText(String(next));
    if (next !== value) onCommit(next);
  };

  return (
    <Input
      type="number"
      inputMode="numeric"
      min={min}
      max={max}
      step={1}
      aria-label={ariaLabel}
      disabled={disabled}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        const n = parseInt(e.target.value, 10);
        if (Number.isFinite(n) && n >= min && n <= max && n !== value) onCommit(n);
      }}
      onBlur={(e) => commit(e.target.value)}
      className="w-20 h-9 text-center font-semibold"
    />
  );
};

/**
 * Rules for automatic chat assignment (Sequential assignment and flow
 * "Assign Random Agent" steps): wait for an agent, and an optional limit of
 * open chats per agent.
 */
const AssignmentRulesCard: React.FC<AssignmentRulesCardProps> = ({ queueEnabled, waitHours, maxOpenChats, disabled, onChange }) => {
  const isLimited = maxOpenChats > 0;

  return (
    <div className="rounded-lg border border-slate-100 dark:border-(--card-border-color)/50 bg-white dark:bg-(--card-color) shadow-sm">
      <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 border-b border-slate-100 dark:border-(--card-border-color)/50">
        <p className="text-sm font-bold text-slate-800 dark:text-white">Auto-assignment rules</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">
          Used when chats are assigned automatically — by Sequential assignment or a flow&apos;s &quot;Assign Random Agent&quot; step. Only agents who are online and set to Available get chats.
        </p>
      </div>

      {/* Wait for an agent */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-(--card-border-color)/50">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className={cn("mt-0.5 p-2 rounded-lg bg-slate-100 dark:bg-(--dark-body)", queueEnabled ? "text-primary" : "text-slate-400")}>
              <Clock size={15} />
            </div>
            <div className="min-w-0">
              <p className={cn("text-sm font-bold", queueEnabled ? "text-slate-800 dark:text-white" : "text-slate-500 dark:text-slate-400")}>Wait for an available agent</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">
                If nobody is available, the chat waits and is assigned automatically as soon as an agent comes online or switches to Available — oldest chat first.
              </p>
            </div>
          </div>
          <ToggleSwitch checked={queueEnabled} onChange={(v) => onChange({ assignment_queue_enabled: v })} disabled={disabled} />
        </div>

        {queueEnabled && (
          <div className="mt-4 ms-0 sm:ms-11 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <span>Keep waiting for</span>
            <NumberBox value={waitHours} min={WAIT_HOURS_MIN} max={WAIT_HOURS_MAX} disabled={disabled} ariaLabel="Waiting time in hours" onCommit={(n) => onChange({ assignment_wait_hours: n })} />
            <span>hours</span>
            <p className="basis-full text-xs text-slate-400 dark:text-slate-500">
              After this the chat stops waiting and stays in Unassigned for you to assign. (1–168 hours)
            </p>
          </div>
        )}
      </div>

      {/* Max open chats per agent */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className={cn("mt-0.5 p-2 rounded-lg bg-slate-100 dark:bg-(--dark-body)", isLimited ? "text-primary" : "text-slate-400")}>
            <UsersRound size={15} />
          </div>
          <div className="min-w-0 flex-1">
            <p className={cn("text-sm font-bold", isLimited ? "text-slate-800 dark:text-white" : "text-slate-500 dark:text-slate-400")}>Open chats per agent</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">
              With a limit, an agent who already has that many open chats gets no new ones until they resolve some — so the work is shared fairly.
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div role="radiogroup" aria-label="Open chats per agent" className="inline-flex rounded-lg border border-slate-200 dark:border-(--card-border-color) p-0.5 bg-slate-50 dark:bg-(--dark-body)">
                {[
                  { label: "No limit", active: !isLimited, value: 0 },
                  { label: "Limit", active: isLimited, value: isLimited ? maxOpenChats : DEFAULT_MAX_CHATS },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    role="radio"
                    aria-checked={opt.active}
                    disabled={disabled}
                    onClick={() => !opt.active && onChange({ max_open_chats_per_agent: opt.value })}
                    className={cn(
                      "px-3.5 h-8 rounded-md text-xs font-bold transition-colors disabled:opacity-50",
                      opt.active ? "bg-white dark:bg-(--card-color) text-primary shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {isLimited && (
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <NumberBox value={maxOpenChats} min={MAX_CHATS_MIN} max={MAX_CHATS_MAX} disabled={disabled} ariaLabel="Max open chats per agent" onCommit={(n) => onChange({ max_open_chats_per_agent: n })} />
                  <span>open chats at a time</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentRulesCard;
