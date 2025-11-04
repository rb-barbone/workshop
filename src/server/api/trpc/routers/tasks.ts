import { getTaskByIdSchema, getTasksSchema, upsertTaskSchema } from "@/shared/validators/task.schema";
import { createTRPCRouter, publicProcedure } from "../init";
import { deleteTask, getTasks, upsertTask } from "@/server/domains/task/task-service";

export const tasksRouter = createTRPCRouter({
  get: publicProcedure
    .input(getTasksSchema)
    .query(async ({ ctx: { db }, input }) => {
      return await getTasks(db, input);
    }),

  upsert: publicProcedure
    .input(upsertTaskSchema)
    .mutation(async ({ ctx: { db }, input }) => {
      return await upsertTask(db, input);
    }),

  delete: publicProcedure
    .input(getTaskByIdSchema)
    .mutation(async ({ ctx: { db }, input }) => {
      return await deleteTask(db, input);
    }),
});

