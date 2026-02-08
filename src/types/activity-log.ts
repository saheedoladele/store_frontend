export interface ActivityLog {
  id: string;
  tenant_id: string;
  user_id: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  action: string;
  entity_type: string;
  entity_id?: string;
  description?: string;
  metadata?: Record<string, any>;
  severity: "info" | "warning" | "error" | "success";
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface ActivityLogFilters {
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  severity?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ActivityLogResponse {
  logs: ActivityLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
