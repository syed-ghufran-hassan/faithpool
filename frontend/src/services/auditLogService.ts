/** Audit Log Service */

export interface AuditEntry {
  id: string;
  timestamp: number;
  action: string;
  userId: string;
  metadata: Record<string, any>;
}

class AuditService {
  /** In-memory log storage */
  private logs: AuditEntry[] = [];

  log(action: string, userId: string, metadata: Record<string, any> = {}) {
    this.logs.push({
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      action,
      userId,
      metadata
    });
  }

  getLogs() {
    return this.logs;
  }
}

export const auditLogger = new AuditService();
