/** Audit Log Service */

export interface AuditEntry {
  id: string;
  timestamp: number;
  action: string;
  userId: string;
  metadata: Record<string, any>;
}
