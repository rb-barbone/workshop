"server-only";

import type { DBClient } from "@/server/db";
import { task_table } from "@/server/db/schema/tasks";
import { TASK_STATUS, TASK_PRIORITIES } from "@/shared/types/tasks";
import type { TaskStatus, TaskPriority } from "@/shared/types/tasks";
import { and, eq, ilike } from "drizzle-orm";

type GetTasksRequest = {
  title?: string | null;
  description?: string | null;
  status?: TaskStatus | null;
  priority?: TaskPriority | null;
};

type GetTaskByIdRequest = {
  id: string;
};

export async function getTasksQuery(db: DBClient, filters: GetTasksRequest) {
  // @ts-expect-error placeholder condition in case we don't have any filters
  const where = [eq(1, 1)];

  if (filters?.title) {
    where.push(ilike(task_table.title, filters.title));
  }

  if (filters?.description) {
    where.push(ilike(task_table.description, filters.description));
  }

  if (filters?.status) {
    where.push(eq(task_table.status, filters.status));
  }

  if (filters?.priority) {
    where.push(eq(task_table.priority, filters.priority));
  }

  return await db.select().from(task_table).where(and(...where));
}

export async function getTaskByIdQuery(db: DBClient, params: GetTaskByIdRequest) {
  return await db.select().from(task_table).where(eq(task_table.id, params.id));
}