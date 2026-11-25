import { AgentShift, AgentShiftInput } from "@/src/types/shift";
import { baseApi } from "./baseApi";

export const shiftApi = baseApi.enhanceEndpoints({ addTagTypes: ["Shifts"] }).injectEndpoints({
  endpoints: (builder) => ({
    getShifts: builder.query<{ success: boolean; data: AgentShift[] }, void>({ query: () => "/agent-shifts", providesTags: ["Shifts"] }),
    getShift: builder.query<{ success: boolean; data: AgentShift }, string>({ query: (id) => `/agent-shifts/${id}`, providesTags: (_r, _e, id) => [{ type: "Shifts", id }] }),
    createShift: builder.mutation<{ success: boolean; message: string; data: AgentShift }, AgentShiftInput>({ query: (body) => ({ url: "/agent-shifts", method: "POST", body }), invalidatesTags: ["Shifts"] }),
    updateShift: builder.mutation<{ success: boolean; message: string; data: AgentShift }, { id: string; body: AgentShiftInput }>({ query: ({ id, body }) => ({ url: `/agent-shifts/${id}`, method: "PUT", body }), invalidatesTags: ["Shifts"] }),
    deleteShift: builder.mutation<{ success: boolean; message: string }, string>({ query: (id) => ({ url: `/agent-shifts/${id}`, method: "DELETE" }), invalidatesTags: ["Shifts"] })
  })
});

export const { useGetShiftsQuery, useGetShiftQuery, useCreateShiftMutation, useUpdateShiftMutation, useDeleteShiftMutation } = shiftApi;
