import { and, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import { db } from "../../config/database.js";
import { auditLogs, branches } from "../../database/schema/index.js";
import { AppError } from "../../utils/errors.js";
import { GetAuditLogsQuery } from "./schema.js";

export class AuditService {
  /**
   * Recursively sanitizes an object to remove any sensitive keys
   */
  private static sanitizeMetadata(meta: any): any {
    if (!meta || typeof meta !== "object") return meta;
    if (Array.isArray(meta)) return meta.map((m) => this.sanitizeMetadata(m));

    const sensitiveKeys = new Set([
      "password",
      "passwordhash",
      "password_hash",
      "currentpassword",
      "newpassword",
      "token",
      "accesstoken",
      "refreshtoken",
      "secret",
      "authorization",
      "cookie",
    ]);

    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(meta)) {
      if (sensitiveKeys.has(key.toLowerCase())) {
        continue; // drop completely
      }
      sanitized[key] = this.sanitizeMetadata(value);
    }
    return sanitized;
  }

  /**
   * Append-only record an audit log event
   */
  static async recordAudit(
    data: {
      actorId?: string | undefined;
      actorName: string;
      actorRole: string;
      action: string;
      category: string;
      entityType: string;
      entityId?: string | undefined;
      branchId?: string | undefined;
      branchName?: string | undefined;
      reason?: string | undefined;
      metadata?: any;
    },
    tx?: any
  ) {
    const client = tx || db;

    // Resolve branch name if branchId provided but branchName missing
    let branchName = data.branchName;
    if (data.branchId && !branchName) {
      const [b] = await client
        .select({ name: branches.name })
        .from(branches)
        .where(eq(branches.id, data.branchId))
        .limit(1);
      if (b) branchName = b.name;
    }

    const cleanMeta = this.sanitizeMetadata(data.metadata);

    const [record] = await client
      .insert(auditLogs)
      .values({
        actorId: data.actorId,
        actorName: data.actorName,
        actorRole: data.actorRole,
        action: data.action,
        category: data.category,
        entityType: data.entityType,
        entityId: data.entityId,
        branchId: data.branchId,
        branchName,
        reason: data.reason,
        metadata: cleanMeta,
      })
      .returning();

    return record;
  }

  /**
   * Fetch audit history with search, filters, pagination, and role-based branch scoping
   */
  static async getAuditLogs(
    user: { id: string; role: string; branchId?: string | null | undefined },
    query: GetAuditLogsQuery
  ) {
    const conditions: any[] = [];

    // Role-based scoping:
    // Employees can only view audit logs associated with their assigned branch
    if (user.role === "EMPLOYEE") {
      if (!user.branchId) {
        throw new AppError("Employee must have an assigned branch to view audit logs", 403, "FORBIDDEN");
      }
      conditions.push(eq(auditLogs.branchId, user.branchId));
      // Restrict sensitive categories from employee view
      conditions.push(sql`${auditLogs.category} NOT IN ('AUTH', 'USERS', 'SETTINGS')`);
    } else if (query.branchId) {
      // Owner can filter by any specific branch
      conditions.push(eq(auditLogs.branchId, query.branchId));
    }

    if (query.category) {
      conditions.push(eq(auditLogs.category, query.category));
    }

    if (query.action) {
      conditions.push(eq(auditLogs.action, query.action));
    }

    if (query.actorId) {
      conditions.push(eq(auditLogs.actorId, query.actorId));
    }

    if (query.startDate) {
      conditions.push(gte(auditLogs.createdAt, query.startDate));
    }

    if (query.endDate) {
      conditions.push(lte(auditLogs.createdAt, query.endDate));
    }

    if (query.search && query.search.trim()) {
      const searchPattern = `%${query.search.trim()}%`;
      conditions.push(
        or(
          ilike(auditLogs.action, searchPattern),
          ilike(auditLogs.actorName, searchPattern),
          ilike(auditLogs.entityId, searchPattern),
          ilike(auditLogs.reason, searchPattern),
          ilike(auditLogs.branchName, searchPattern)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const limit = query.limit;
    const page = query.page;
    const offset = (page - 1) * limit;

    const [items, totalResult] = await Promise.all([
      db
        .select()
        .from(auditLogs)
        .where(whereClause)
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(auditLogs)
        .where(whereClause),
    ]);

    const total = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      logs: items,
      total,
      page,
      totalPages,
      limit,
    };
  }

  /**
   * Get single audit record with full details
   */
  static async getAuditLogById(id: string, user: { id: string; role: string; branchId?: string | null | undefined }) {
    const [record] = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.id, id))
      .limit(1);

    if (!record) {
      throw new AppError("Audit log entry not found", 404, "NOT_FOUND");
    }

    if (user.role === "EMPLOYEE") {
      if (record.branchId !== user.branchId || ["AUTH", "USERS", "SETTINGS"].includes(record.category)) {
        throw new AppError("You are not authorized to view this audit record", 403, "FORBIDDEN");
      }
    }

    return record;
  }
}
