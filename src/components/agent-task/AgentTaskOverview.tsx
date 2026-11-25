/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/src/elements/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/elements/ui/select";
import { TaskStatus } from "@/src/types/agentTask";
import { formatDate } from "@/src/utils";
import { Activity, Calendar, CalendarCheck, CalendarClock, Edit3, Flag, Trash2, User, X } from "lucide-react";
import { ReactNode } from "react";
import Can from "../shared/Can";

export const TASK_STATUS_OPTIONS: { label: string; value: TaskStatus; color: string }[] = [
  { label: "Pending", value: "pending", color: "bg-slate-400" },
  { label: "In Progress", value: "in_progress", color: "bg-amber-500" },
  { label: "On Hold", value: "on_hold", color: "bg-blue-500" },
  { label: "Completed", value: "completed", color: "bg-primary" },
  { label: "Cancelled", value: "cancelled", color: "bg-red-500" },
];

const PRIORITY_STYLE: Record<string, { icon: string; text: string; badge: string }> = {
  high: { icon: "text-red-500 fill-red-500", text: "text-red-600", badge: "bg-red-50 text-red-600 dark:bg-red-900/20" },
  medium: { icon: "text-amber-500 fill-amber-500", text: "text-amber-600", badge: "bg-amber-50 text-amber-600 dark:bg-amber-900/20" },
  low: { icon: "text-slate-400 fill-slate-400", text: "text-slate-500", badge: "bg-slate-100 text-slate-500 dark:bg-(--dark-sidebar)" },
};

interface AgentTaskOverviewProps {
  task: any;
  canEditStatus: boolean;
  isUpdatingStatus: boolean;
  isDeleting: boolean;
  onStatusChange: (status: TaskStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

/** One section of the panel, styled like the Contact Overview sections in WA Chat. */
const Section = ({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) => (
  <div className="border-b border-gray-100 dark:border-(--card-border-color) dark:bg-(--table-hover) p-5 space-y-3">
    <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
      <div className="p-1.5 rounded-lg bg-primary/10 text-primary">{icon}</div>
      <span>{title}</span>
    </div>
    {children}
  </div>
);

const ValueBox = ({ children }: { children: ReactNode }) => (
  <div className="flex items-center gap-3 bg-white dark:bg-(--dark-sidebar) border border-gray-100 dark:border-(--card-border-color) px-4 rounded-lg h-11 text-sm text-slate-700 dark:text-gray-300">{children}</div>
);

const AgentTaskOverview = ({ task, canEditStatus, isUpdatingStatus, isDeleting, onStatusChange, onEdit, onDelete, onClose }: AgentTaskOverviewProps) => {
  const status = TASK_STATUS_OPTIONS.find((o) => o.value === task.status);
  const priority = PRIORITY_STYLE[task.task_priority] || PRIORITY_STYLE.low;
  const agentName = task.agent_id?.name || "Unassigned";

  return (
    <div className="w-full max-w-[364px] sm:min-w-[364px] sm:max-w-[364px] border rounded-lg border-gray-100 bg-white dark:bg-(--card-color) dark:border-(--card-border-color) h-full flex flex-col overflow-hidden [@media(max-width:1279px)]:absolute [@media(max-width:1279px)]:z-40 [@media(max-width:1279px)]:right-0 [@media(max-width:1279px)]:top-0 [@media(max-width:1279px)]:shadow-xl [@media(max-width:375px)]:max-w-[calc(100%-20px)] animate-in fade-in slide-in-from-right-2 duration-300">
      <div className="h-14 flex items-center justify-between gap-3 px-6 border-b border-gray-200 dark:border-(--card-border-color) shrink-0">
        <span className="font-bold text-slate-800 dark:text-white text-lg">Task Details</span>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-lg hover:bg-slate-100 dark:hover:bg-(--table-hover) xl:hidden" aria-label="Close task details">
          <X size={20} className="text-slate-500 dark:text-gray-200" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Summary */}
        <div className="relative border-b border-gray-100 dark:border-(--card-border-color) dark:bg-(--table-hover) p-5 flex flex-col items-center text-center">
          <div className="absolute top-2 right-2 flex gap-1.5">
            <Can permission="update.agent-task">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-primary bg-primary/5 hover:bg-primary/10 rounded-lg" onClick={onEdit} aria-label="Edit task">
                <Edit3 size={17} />
              </Button>
            </Can>
            <Can permission="delete.agent-task">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 bg-rose-50 hover:bg-rose-50 dark:bg-red-900/20 rounded-lg" onClick={onDelete} disabled={isDeleting} aria-label="Delete task">
                <Trash2 size={17} />
              </Button>
            </Can>
          </div>
          <div className="h-12 w-12 mb-4 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl">{(task.title || "T").charAt(0).toUpperCase()}</div>
          <h3 className="font-bold text-slate-900 dark:text-white break-words max-w-full px-6">{task.title}</h3>
          <div className="flex items-center gap-2 mt-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-(--dark-sidebar) dark:text-gray-300">
              <span className={`w-2 h-2 rounded-full ${status?.color || "bg-slate-400"}`} />
              {status?.label || task.status}
            </span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${priority.badge}`}>{task.task_priority} priority</span>
          </div>
        </div>

        <Section icon={<Activity size={18} />} title="Status">
          {canEditStatus ? (
            <Select value={task.status} onValueChange={(v) => onStatusChange(v as TaskStatus)} disabled={isUpdatingStatus}>
              <SelectTrigger className="w-full bg-white dark:bg-(--dark-sidebar) border border-gray-100 dark:border-(--card-border-color) h-11 px-4 rounded-lg font-semibold text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-lg dark:bg-(--page-body-bg) dark:border-(--card-border-color) border-slate-100 shadow-xl p-1">
                {TASK_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="rounded-lg dark:hover:bg-(--card-color) font-medium text-xs py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${opt.color}`} />
                      <span>{opt.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <ValueBox>
              <span className={`w-2 h-2 rounded-full ${status?.color || "bg-slate-400"}`} />
              <span className="font-semibold">{status?.label || task.status}</span>
            </ValueBox>
          )}
        </Section>

        <Section icon={<User size={18} />} title="Assignee">
          <ValueBox>
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">{agentName.charAt(0).toUpperCase()}</div>
            <span className="truncate">{agentName}</span>
          </ValueBox>
        </Section>

        <Section icon={<Calendar size={18} />} title="Due Date">
          <ValueBox>
            <Calendar size={17} className="text-slate-400" />
            <span>{task.due_date ? formatDate(task.due_date) : "No deadline"}</span>
          </ValueBox>
        </Section>

        <Section icon={<Flag size={18} />} title="Priority">
          <ValueBox>
            <Flag size={17} className={priority.icon} />
            <span className={`capitalize ${priority.text}`}>{task.task_priority}</span>
          </ValueBox>
        </Section>

        {(task.created_at || task.started_at || task.completed_at) && (
          <Section icon={<CalendarClock size={18} />} title="Timeline">
            <div className="space-y-2 text-sm">
              {task.created_at && (
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500 dark:text-gray-400">Created</span>
                  <span className="text-slate-700 dark:text-gray-300">{formatDate(task.created_at)}</span>
                </div>
              )}
              {task.started_at && (
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500 dark:text-gray-400">Started</span>
                  <span className="text-slate-700 dark:text-gray-300">{formatDate(task.started_at)}</span>
                </div>
              )}
              {task.completed_at && (
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500 dark:text-gray-400 inline-flex items-center gap-1.5">
                    <CalendarCheck size={14} /> Completed
                  </span>
                  <span className="text-slate-700 dark:text-gray-300">{formatDate(task.completed_at)}</span>
                </div>
              )}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
};

export default AgentTaskOverview;
