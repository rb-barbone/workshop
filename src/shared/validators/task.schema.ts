import { z } from "@hono/zod-openapi";
import { parseAsString, parseAsStringEnum } from "nuqs/server";
import { TASK_PRIORITIES, TASK_STATUS } from "../types/tasks";

export const getTasksSchema = z.object({
  title: z.string().nullable().optional().openapi({
    description: "Filter tasks by title",
    example: "Task 1",
  }),
  description: z.string().nullable().optional().openapi({
    description: "Filter tasks by description",
    example: "Description of the task",
  }),
  status: z.enum(TASK_STATUS).nullable().optional().openapi({
    description: "Filter tasks by status",
    example: "BACKLOG",
  }),
  priority: z.enum(TASK_PRIORITIES).nullable().optional().openapi({
    description: "Filter tasks by priority",
    example: "LOW",
  }),
});

export const getTaskByIdSchema = z.object({
  id: z.guid().openapi({
    description: "The ID of the task",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
});

export const taskResponseSchema = z.object({
  id: z.guid().openapi({
    description: "The ID of the task",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  userId: z.uuid().nullable().openapi({
    description: "The ID of the user (UUID)",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  title: z.string().openapi({
    description: "The title of the task",
    example: "Task 1",
  }),
  description: z.string().openapi({
    description: "The description of the task",
    example: "Description of the task",
  }),
  status: z.enum(TASK_STATUS).openapi({
    description: "The status of the task",
    example: "BACKLOG",
  }),
  priority: z.enum(TASK_PRIORITIES).openapi({
    description: "The priority of the task",
    example: "LOW",
  }),
});

export const tasksResponseSchema = z.object({
  data: z.array(taskResponseSchema).nullable(),
});

export const upsertTaskSchema = z.object({
  id: z.guid().openapi({
    description: "The ID of the task to update",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  title: z.string().openapi({
    description: "The title of the task",
    example: "Task 1",
  }),
  description: z.string().optional().openapi({
    description: "The description of the task",
    example: "Description of the task",
  }),
  status: z.enum(TASK_STATUS).optional().openapi({
    description: "The status of the task",
    example: "BACKLOG",
  }),
  priority: z.enum(TASK_PRIORITIES).optional().openapi({
    description: "The priority of the task",
    example: "LOW",
  }),
  userId: z.uuid().nullable().openapi({
    description: "The ID of the user (UUID)",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
});

export const assignUserToTaskSchema = z.object({
  id: z.guid().openapi({
    description: "Task ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  userId: z
    .uuid()
    .nullable()
    .openapi({ description: "User ID (UUID) or null per rimuovere" }),
});

export const assignStatusToTaskSchema = z.object({
  id: z.guid().openapi({
    description: "Task ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  status: z.enum(TASK_STATUS).openapi({ description: "Nuovo stato del task" }),
});

export const taskFilterParamsSchema = {
  search: parseAsString,
  title: parseAsString,
  description: parseAsString,
  status: parseAsStringEnum([...TASK_STATUS] as string[]),
  priority: parseAsStringEnum([...TASK_PRIORITIES] as string[]),
};
