import type { DBClient } from "@/server/db";
import type { getTaskByIdSchema, getTasksSchema, upsertTaskSchema } from "@/shared/validators/task.schema";
import type z from "zod";
import { getTaskByIdQuery, getTasksQuery } from "./queries";
import { deleteTaskMutation, upsertTaskMutation } from "./mutations";


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