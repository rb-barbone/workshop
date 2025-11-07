"server-only";

import { and, eq, ilike } from "drizzle-orm";
import type { DBClient } from "@/server/db";
import { user } from "@/server/db/schema/auth-schema";
import { task_table } from "@/server/db/schema/tasks";
import type { TaskPriority, TaskStatus } from "@/shared/types/tasks";

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

  return await db
    .select({
      id: task_table.id,
      userId: task_table.userId,
      title: task_table.title,
      description: task_table.description,
      status: task_table.status,
      priority: task_table.priority,
      userName: user.name,
    })
    .from(task_table)
    .leftJoin(user, eq(user.id, task_table.userId))
    .where(and(...where));
}

export async function getTaskByIdQuery(
  db: DBClient,
  params: GetTaskByIdRequest,
) {
  return await db.select().from(task_table).where(eq(task_table.id, params.id));
}
