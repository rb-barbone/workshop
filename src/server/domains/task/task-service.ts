import type z from "zod";
import type { DBClient } from "@/server/db";
import type {
  assignStatusToTaskSchema,
  assignUserToTaskSchema,
  getTaskByIdSchema,
  getTasksSchema,
  upsertTaskSchema,
} from "@/shared/validators/task.schema";
import {
  assignStatusToTaskMutation,
  assignUserToTaskMutation,
  deleteTaskMutation,
  upsertTaskMutation,
} from "./mutations";
import { getTaskByIdQuery, getTasksQuery } from "./queries";

export async function getTasks(
  db: DBClient,
  filters: z.infer<typeof getTasksSchema>,
) {
  return await getTasksQuery(db, filters);
}

export async function getTaskById(
  db: DBClient,
  filters: z.infer<typeof getTaskByIdSchema>,
) {
  return await getTaskByIdQuery(db, filters);
}

export async function upsertTask(
  db: DBClient,
  params: z.infer<typeof upsertTaskSchema>,
) {
  return await upsertTaskMutation(db, params);
}

export async function deleteTask(
  db: DBClient,
  params: z.infer<typeof getTaskByIdSchema>,
) {
  return await deleteTaskMutation(db, params);
}

export async function assignUserToTask(
  db: DBClient,
  params: z.infer<typeof assignUserToTaskSchema>,
) {
  return await assignUserToTaskMutation(db, params);
}

export async function assignStatusToTask(
  db: DBClient,
  params: z.infer<typeof assignStatusToTaskSchema>,
) {
  return await assignStatusToTaskMutation(db, params);
}
