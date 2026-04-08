import { apiSlice } from "../api/apiSlice";
import { ActivityLogResponse } from "@/types/activity-log-type";

export const activityApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getActivityLogs: builder.query<ActivityLogResponse, { limit?: number; eventType?: string } | void>({
      query: (params) => {
        const query = new URLSearchParams();
        if (params && typeof params === "object") {
          if (params.limit) query.set("limit", String(params.limit));
          if (params.eventType) query.set("eventType", params.eventType);
        }
        const suffix = query.toString() ? `?${query.toString()}` : "";
        return `/api/admin/activity-logs${suffix}`;
      },
      providesTags: ["ActivityLogs"],
      keepUnusedDataFor: 60,
    }),
  }),
});

export const { useGetActivityLogsQuery } = activityApi;
