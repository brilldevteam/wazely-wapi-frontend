export type ShiftRange = { start: string; end: string };
export type ShiftDay = { enabled: boolean; ranges: ShiftRange[] };

export interface AgentShift {
  _id: string;
  name: string;
  timezone: string;
  status: "active" | "inactive";
  assigned_agents?: number;
  monday: ShiftDay;
  tuesday: ShiftDay;
  wednesday: ShiftDay;
  thursday: ShiftDay;
  friday: ShiftDay;
  saturday: ShiftDay;
  sunday: ShiftDay;
}

export type AgentShiftInput = Omit<AgentShift, "_id" | "assigned_agents">;
