import {
  assignStatusToTask,
  assignUserToTask,
  deleteTask,
  getTasks,
  upsertTask,
} from "@/server/domains/task/task-service";
import {
  assignStatusToTaskSchema,
  assignUserToTaskSchema,
  getTaskByIdSchema,
  getTasksSchema,
  upsertTaskSchema,
} from "@/shared/validators/task.schema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../init";

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

  assignUser: protectedProcedure
    .input(assignUserToTaskSchema)
    .mutation(async ({ ctx: { db }, input }) => {
      return await assignUserToTask(db, input);
    }),

  assignStatus: protectedProcedure
    .input(assignStatusToTaskSchema)
    .mutation(async ({ ctx: { db }, input }) => {
      return await assignStatusToTask(db, input);
    }),
});
