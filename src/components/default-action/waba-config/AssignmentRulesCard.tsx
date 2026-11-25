"use client";

import { Input } from "@/src/elements/ui/input";
import { cn } from "@/src/lib/utils";
import { Clock, UsersRound } from "lucide-react";
import React, { useState } from "react";

export const MAX_CHATS_MIN = 1;
export const MAX_CHATS_MAX = 1000;
export const DEFAULT_MAX_CHATS = 10;

interface AssignmentRulesCardProps {
  maxOpenChats: number; // 0 = no limit
  assignmentStrategy: "round_robin" | "least_open";
  disabled?: boolean;
  onChange: (changes: { assignment_queue_enabled?: boolean; assignment_wait_hours?: number; max_open_chats_per_agent?: number; assignment_strategy?: "round_robin" | "least_open" }) => void;
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
const AssignmentRulesCard: React.FC<AssignmentRulesCardProps> = ({ maxOpenChats, assignmentStrategy, disabled, onChange }) => {
  const isLimited = maxOpenChats > 0;

  return (
    <div className="rounded-lg border border-slate-100 dark:border-(--card-border-color)/50 bg-white dark:bg-(--card-color) shadow-sm">
      <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 border-b border-slate-100 dark:border-(--card-border-color)/50">
        <p className="text-sm font-bold text-slate-800 dark:text-white">Auto-assignment rules</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">
          Used when chats are assigned automatically — by Sequential assignment or a flow&apos;s &quot;Assign Random Agent&quot; step. Only agents who are online and set to Available get chats.
        </p>
      </div>

      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-(--card-border-color)/50 flex items-start gap-3">
        <div className="mt-0.5 p-2 rounded-lg bg-primary/10 text-primary"><Clock size={15} /></div>
        <div><p className="text-sm font-bold text-slate-800 dark:text-white">Always wait for an available agent</p><p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">When nobody is eligible, the chat remains in the queue until an agent comes online, becomes Available, starts their shift, or frees capacity.</p></div>
      </div>

      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-(--card-border-color)/50">
        <p className="text-sm font-bold text-slate-800 dark:text-white">Distribution method</p>
        <p className="text-xs text-slate-400 mt-0.5">Choose a fair rotation or give the next chat to the least-loaded eligible agent.</p>
        <div className="mt-3 inline-flex rounded-lg border border-slate-200 dark:border-(--card-border-color) p-1 gap-1">
          <button type="button" disabled={disabled} onClick={() => onChange({ assignment_strategy: "round_robin" })} className={cn("px-3 py-2 rounded-md text-xs font-bold", assignmentStrategy === "round_robin" ? "bg-primary text-white" : "text-slate-500")}>Round-robin</button>
          <button type="button" disabled={disabled} onClick={() => onChange({ assignment_strategy: "least_open" })} className={cn("px-3 py-2 rounded-md text-xs font-bold", assignmentStrategy === "least_open" ? "bg-primary text-white" : "text-slate-500")}>Least open chats</button>
        </div>
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
