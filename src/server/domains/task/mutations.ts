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
  userId?: string | null;
};

export async function upsertTaskMutation(
  db: DBClient,
  params: UpsertTaskParams, 
) {
  const { id, userId, ...rest } = params;

  // Costruisci i valori evitando di sovrascrivere userId quando è null/undefined
  const insertValues = {
    id,
    title: rest.title!,
    description: rest.description,
    status: rest.status,
    priority: rest.priority!,
  } as typeof task_table.$inferInsert;
  if (userId !== undefined && userId !== null) {
    insertValues.userId = userId as any;
  }

  const [task] = await db
    .insert(task_table)
    .values(insertValues)
    .onConflictDoUpdate({
      target: task_table.id,
      set: {
        ...rest,
        ...(userId !== undefined && userId !== null ? { userId } : {}),
      },
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

type AssignUserParams = { id: string; userId: string | null };

export async function assignUserToTaskMutation(db: DBClient, params: AssignUserParams) {
  const [result] = await db
    .update(task_table)
    .set({ userId: params.userId })
    .where(eq(task_table.id, params.id))
    .returning({
      id: task_table.id,
      userId: task_table.userId,
    });

  return result;
}

type AssignStatusParams = { id: string; status: TaskStatus };

export async function assignStatusToTaskMutation(db: DBClient, params: AssignStatusParams) {
  const [result] = await db
    .update(task_table)
    .set({ status: params.status })
    .where(eq(task_table.id, params.id))
    .returning({ id: task_table.id, status: task_table.status });

  return result;
}