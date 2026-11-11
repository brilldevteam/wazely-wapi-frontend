/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/src/elements/ui/button";
import { usePermissions } from "@/src/hooks/usePermissions";
import { useDeleteAgentTaskMutation, useGetAgentTaskByIdQuery, useUpdateAgentTaskStatusMutation } from "@/src/redux/api/agentTaskApi";
import ConfirmModal from "@/src/shared/ConfirmModal";
import { AgentTaskDetailProps } from "@/src/types/agent";
import { TaskStatus } from "@/src/types/agentTask";
import { Check, FileText, LayoutList, Loader2, PanelRight, User } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Can from "../shared/Can";
import AgentTaskComments from "./AgentTaskComments";
import AgentTaskOverview, { TASK_STATUS_OPTIONS } from "./AgentTaskOverview";
import { ROUTES } from "@/src/constants";

const card = "bg-white dark:bg-(--card-color) border border-gray-100 dark:border-(--card-border-color) rounded-lg";

const AgentTaskDetail = ({ taskId, onToggleSidebar }: AgentTaskDetailProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const agentId = searchParams.get("agentId");
  const { hasPermission } = usePermissions();
  const { data: taskResult, isLoading, error } = useGetAgentTaskByIdQuery(taskId, { skip: !taskId });
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateAgentTaskStatusMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteAgentTaskMutation();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  // The details panel is always shown on wide screens; on smaller screens it opens over the page.
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  if (!taskId) {
    return (
      <div className={`${card} flex-1 flex flex-col items-center justify-center p-10 opacity-60`}>
        <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-slate-400" />
        </div>
        <p className="font-bold text-slate-400 uppercase tracking-widest text-sm">NO DIALOGUE YET</p>
      </div>
    );
  }

  const task = taskResult?.data;

  if (isLoading) {
    return (
      <div className={`${card} flex-1 flex flex-col items-center justify-center p-10 opacity-60`}>
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="font-bold text-slate-500 tracking-widest text-sm">Loading task details...</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className={`${card} flex-1 flex items-center justify-center p-10 text-slate-400`}>
        <p className="font-bold capitalize tracking-widest text-sm">Failed to load task details</p>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: TaskStatus) => {
    try {
      await updateStatus({ id: task._id, status: newStatus }).unwrap();
      toast.success("Task status updated");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update status");
    }
  };

  const handleEdit = () => {
    const taskAgentId = typeof task.agent_id === "string" ? task.agent_id : task.agent_id?._id;
    if (taskAgentId) {
      router.push(`${ROUTES.TasksEdit}/${task._id}?agentId=${taskAgentId}`);
    } else {
      toast.error("Agent ID missing, cannot edit task");
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteTask([task._id]).unwrap();
      toast.success("Task deleted successfully");
      setIsDeleteModalOpen(false);
      router.push(agentId ? `${ROUTES.Tasks}?agentId=${agentId}` : ROUTES.Tasks);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete task");
    }
  };

  const status = TASK_STATUS_OPTIONS.find((o) => o.value === task.status);

  return (
    <div className="flex flex-1 gap-4 h-full min-w-0 relative">
      {/* Middle: task name, description and the updates thread */}
      <div className={`${card} flex-1 flex flex-col min-w-0 overflow-hidden`}>
        <div className="h-14 flex items-center justify-between gap-3 px-4 sm:px-6 border-b border-gray-200 dark:border-(--card-border-color) shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" className="h-9 w-9 bg-primary/10 text-primary rounded-lg [@media(min-width:992px)]:hidden hover:bg-primary/20 shrink-0" onClick={onToggleSidebar} aria-label="Show task list">
              <LayoutList size={18} />
            </Button>
            <div className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">{(task.title || "T").charAt(0).toUpperCase()}</div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-800 dark:text-white line-clamp-1 leading-tight">{task.title}</h2>
              <p className="text-xs text-slate-500 dark:text-gray-400 flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${status?.color || "bg-slate-400"}`} />
                {status?.label || task.status}
                {task.agent_id?.name ? <span className="truncate">· {task.agent_id.name}</span> : null}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Can permission="update.agent-task">
              <Button className="bg-primary text-white gap-2 h-9 px-4 font-semibold rounded-lg shadow-lg shadow-primary/10 active:scale-95" disabled={task.status === "completed" || isUpdatingStatus} onClick={() => handleStatusChange("completed")}>
                <Check size={17} />
                <span className="[@media(max-width:480px)]:hidden">Mark Complete</span>
              </Button>
            </Can>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg border border-gray-100 dark:border-(--card-border-color) text-slate-500 hover:text-primary xl:hidden" onClick={() => setIsDetailsOpen((v) => !v)} aria-label="Show task details">
              <PanelRight size={18} />
            </Button>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-(--card-border-color) bg-slate-50/60 dark:bg-(--table-hover) shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            <FileText size={14} /> Description
          </div>
          <p className="text-sm text-slate-700 dark:text-gray-300 whitespace-pre-wrap break-words max-h-40 overflow-y-auto custom-scrollbar">{task.description || "No description"}</p>
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          <AgentTaskComments taskId={task._id} comments={task.agent_comments || []} />
        </div>
      </div>

      {/* Right: task details (like Contact Overview in WA Chat) */}
      <div className={`${isDetailsOpen ? "flex" : "hidden"} xl:flex h-full`}>
        <AgentTaskOverview
          task={task}
          canEditStatus={hasPermission("update.agent-task")}
          isUpdatingStatus={isUpdatingStatus}
          isDeleting={isDeleting}
          onStatusChange={handleStatusChange}
          onEdit={handleEdit}
          onDelete={() => setIsDeleteModalOpen(true)}
          onClose={() => setIsDetailsOpen(false)}
        />
      </div>

      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} isLoading={isDeleting} title="Delete Task" subtitle="Are you sure you want to delete this task? This action cannot be undone." />
    </div>
  );
};

export default AgentTaskDetail;
