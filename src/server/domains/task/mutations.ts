import type { DBClient } from "@/server/db";
import { task_table } from "@/server/db/schema/tasks";
import type { TaskPriority, TaskStatus } from "@/shared/types/tasks";
import type { getTaskByIdSchema, upsertTaskSchema } from "@/shared/validators/task.schema";
import { eq } from "drizzle-orm";
import type z from "zod";


type UpsertTaskParams = {
  id?: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
};

export async function upsertTaskMutation(
  db: DBClient,
  params: UpsertTaskParams, 
) {
  const { id, ...rest } = params;

  const [task] = await db
    .insert(task_table)
    .values({ id, ...rest })
    .onConflictDoUpdate({
      target: task_table.id,
      set: { ...rest },
    })
    .returning();

  return task;
}

export async function deleteTaskMutation(
  db: DBClient,
  params: z.infer<typeof getTaskByIdSchema>,
) {

  const [result] = await db
    .delete(task_table)
    .where(eq(task_table.id, params.id))
    .returning({
      id: task_table.id,
      title: task_table.title,
      description: task_table.description,
      status: task_table.status,
      priority: task_table.priority,
    });

  return result;
}