"use client";

import { Button } from "@/src/elements/ui/button";
import { Input } from "@/src/elements/ui/input";
import { Label } from "@/src/elements/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/elements/ui/select";
import { Switch } from "@/src/elements/ui/switch";
import { useCreateShiftMutation, useDeleteShiftMutation, useGetShiftsQuery, useUpdateShiftMutation } from "@/src/redux/api/shiftApi";
import { AgentShift, AgentShiftInput, ShiftDay } from "@/src/types/shift";
import { Clock3, Edit3, Plus, Save, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import ConfirmModal from "@/src/shared/ConfirmModal";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
const emptyDay = (): ShiftDay => ({ enabled: false, ranges: [{ start: "09:00", end: "17:00" }] });
const emptyShift = (): AgentShiftInput => ({ name: "", timezone: "Asia/Qatar", status: "active", monday: emptyDay(), tuesday: emptyDay(), wednesday: emptyDay(), thursday: emptyDay(), friday: emptyDay(), saturday: emptyDay(), sunday: emptyDay() });
const ZONES = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : ["Asia/Qatar", "Asia/Colombo", "Asia/Dubai", "Asia/Kolkata", "Europe/London", "America/New_York"];

const summary = (shift: AgentShift) => DAYS.filter((day) => shift[day]?.enabled).map((day) => `${day.slice(0, 3)} ${shift[day].ranges.map((range) => `${range.start}–${range.end}`).join(", ")}`).join(" · ") || "No working days";

export default function ShiftsPage() {
  const { data, isLoading } = useGetShiftsQuery();
  const [createShift, { isLoading: creating }] = useCreateShiftMutation();
  const [updateShift, { isLoading: updating }] = useUpdateShiftMutation();
  const [deleteShift] = useDeleteShiftMutation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AgentShiftInput>(emptyShift());
  const [showForm, setShowForm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AgentShift | null>(null);
  const shifts = useMemo(() => data?.data || [], [data]);
  const errorMessage = (error: unknown) => (error as { data?: { message?: string } })?.data?.message;

  const edit = (shift: AgentShift) => {
    const input = { ...shift } as AgentShift & { assigned_agents?: number };
    delete input.assigned_agents;
    setEditingId(shift._id);
    setForm(input);
    setShowForm(true);
  };
  const close = () => { setShowForm(false); setEditingId(null); setForm(emptyShift()); };
  const save = async () => {
    try {
      if (editingId) await updateShift({ id: editingId, body: form }).unwrap();
      else await createShift(form).unwrap();
      toast.success(editingId ? "Shift updated" : "Shift created");
      close();
    } catch (error: unknown) { toast.error(errorMessage(error) || "Could not save shift"); }
  };
  const remove = async () => {
    if (!pendingDelete) return;
    try { await deleteShift(pendingDelete._id).unwrap(); toast.success("Shift deleted"); setPendingDelete(null); } catch (error: unknown) { toast.error(errorMessage(error) || "Could not delete shift"); }
  };
  const setDay = (day: typeof DAYS[number], value: ShiftDay) => setForm((current) => ({ ...current, [day]: value }));

  return <div className="p-4 sm:p-8 space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div><h1 className="text-2xl font-semibold text-primary">Agent Shifts</h1><p className="text-sm text-slate-500 mt-1">Control when agents are eligible for automatic chat assignment.</p></div>
      <Button onClick={() => { close(); setShowForm(true); }} className="gap-2"><Plus size={17}/> Create shift</Button>
    </div>

    {showForm && <div className="bg-white dark:bg-(--card-color) border dark:border-(--card-border-color) rounded-xl p-4 sm:p-6 space-y-5">
      <div className="flex justify-between"><h2 className="font-semibold text-lg">{editingId ? "Edit shift" : "New shift"}</h2><Button variant="ghost" size="icon" onClick={close}><X size={18}/></Button></div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2"><Label>Shift name</Label><Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Day shift"/></div>
        <div className="space-y-2"><Label>Timezone</Label><Input list="iana-timezones" value={form.timezone} onChange={(event) => setForm({ ...form, timezone: event.target.value })} placeholder="Search timezone"/><datalist id="iana-timezones">{ZONES.map((zone) => <option key={zone} value={zone}/>)}</datalist></div>
        <div className="space-y-2"><Label>Status</Label><Select value={form.status} onValueChange={(status: "active" | "inactive") => setForm({ ...form, status })}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></div>
      </div>
      <div className="space-y-3">{DAYS.map((day) => {
        const config = form[day];
        return <div key={day} className="grid sm:grid-cols-[130px_1fr] gap-3 border rounded-lg p-3 dark:border-(--card-border-color)">
          <div className="flex items-center gap-2"><Switch checked={config.enabled} onCheckedChange={(enabled) => setDay(day, { ...config, enabled, ranges: enabled && config.ranges.length === 0 ? [{ start: "09:00", end: "17:00" }] : config.ranges })}/><span className="capitalize font-medium">{day}</span></div>
          <div className="space-y-2">{config.enabled ? <>{config.ranges.map((range, index) => <div key={index} className="flex flex-wrap sm:flex-nowrap items-center gap-2">{range.start === "00:00" && range.end === "24:00" ? <><span className="flex-1 min-w-40 rounded-md border px-3 py-2 text-sm">All day (24 hours)</span><Button className="shrink-0" variant="outline" size="sm" onClick={() => setDay(day, { ...config, ranges: [{ start: "09:00", end: "17:00" }] })}>Set hours</Button></> : <><Input className="min-w-28 flex-1" type="time" value={range.start} onChange={(event) => setDay(day, { ...config, ranges: config.ranges.map((item, i) => i === index ? { ...item, start: event.target.value } : item) })}/><span>to</span><Input className="min-w-28 flex-1" type="time" value={range.end} onChange={(event) => setDay(day, { ...config, ranges: config.ranges.map((item, i) => i === index ? { ...item, end: event.target.value } : item) })}/><Button className="shrink-0" variant="ghost" size="icon" disabled={config.ranges.length === 1} onClick={() => setDay(day, { ...config, ranges: config.ranges.filter((_, i) => i !== index) })}><Trash2 size={15}/></Button></>}</div>)}<div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" disabled={config.ranges.length >= 6} onClick={() => setDay(day, { ...config, ranges: [...config.ranges, { start: "09:00", end: "17:00" }] })}>+ Add range</Button><Button variant="outline" size="sm" onClick={() => setDay(day, { ...config, ranges: [{ start: "00:00", end: "24:00" }] })}>All day</Button></div></> : <span className="text-sm text-slate-400">Closed</span>}</div>
        </div>;
      })}</div>
      <div className="flex justify-end gap-2"><Button variant="outline" onClick={close}>Cancel</Button><Button disabled={!form.name.trim() || creating || updating} onClick={save} className="gap-2"><Save size={16}/> Save shift</Button></div>
    </div>}

    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{isLoading ? <p>Loading shifts…</p> : shifts.length === 0 ? <div className="col-span-full text-center py-16 border border-dashed rounded-xl text-slate-500">No shifts created. Agents without a shift remain eligible at any time.</div> : shifts.map((shift) => <div key={shift._id} className="bg-white dark:bg-(--card-color) border dark:border-(--card-border-color) rounded-xl p-5 space-y-4">
      <div className="flex justify-between gap-3"><div className="flex gap-3"><div className="p-2 rounded-lg bg-primary/10 text-primary h-fit"><Clock3 size={19}/></div><div><h3 className="font-semibold">{shift.name}</h3><p className="text-xs text-slate-500">{shift.timezone} · {shift.status}</p></div></div><div className="flex"><Button variant="ghost" size="icon" onClick={() => edit(shift)}><Edit3 size={16}/></Button><Button variant="ghost" size="icon" onClick={() => setPendingDelete(shift)}><Trash2 size={16} className="text-red-500"/></Button></div></div>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{summary(shift)}</p>{shift.status === "inactive" && <p className="text-xs text-amber-600">Paused: assigned agents will not receive automatic chats.</p>}<p className="text-xs font-medium text-primary">{shift.assigned_agents || 0} assigned agent(s)</p>
    </div>)}</div>
    <ConfirmModal isOpen={!!pendingDelete} onClose={() => setPendingDelete(null)} onConfirm={remove} title={`Delete ${pendingDelete?.name || "shift"}?`} subtitle={pendingDelete?.assigned_agents ? `This shift is assigned to ${pendingDelete.assigned_agents} agent(s). Reassign them before deleting it.` : "This shift will be permanently removed."} confirmText="Delete shift" variant="danger" />
  </div>;
}
