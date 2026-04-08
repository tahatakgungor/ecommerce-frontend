export interface ActivityLogItem {
  id: string;
  eventType: string;
  severity: string;
  message: string;
  actor?: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface ActivityLogResponse {
  success: boolean;
  data: {
    logs: ActivityLogItem[];
    total: number;
  };
}
