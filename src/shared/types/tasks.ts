import { z } from "zod";

export const TASK_STATUS = ["BACKLOG", "TODO", "IN_PROGRESS", "DONE", "CANCELED"] as const;
export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;

export type TaskStatus = typeof TASK_STATUS[number];
export type TaskPriority = typeof TASK_PRIORITIES[number];


export const TaskStatusSchema = z.enum(TASK_STATUS);
export const TaskPrioritySchema = z.enum(TASK_PRIORITIES);