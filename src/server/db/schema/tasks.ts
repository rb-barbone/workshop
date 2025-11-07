import { pgEnum } from "drizzle-orm/pg-core";
import { TASK_PRIORITIES, TASK_STATUS } from "@/shared/types/tasks";
import { timestamps } from "../utils";
import { createTable } from "./_table";
import { user } from "./auth-schema";

export const taskStatusEnum = pgEnum("task_status", TASK_STATUS);
export const taskPriorityEnum = pgEnum("task_priority", TASK_PRIORITIES);

export const task_table = createTable("task_table", (d) => ({
  id: d.uuid().defaultRandom().primaryKey().notNull(),
  title: d.varchar({ length: 256 }).notNull(),
  description: d.text(),
  userId: d.uuid("user_id").references(() => user.id),
  status: taskStatusEnum("status").notNull().default("BACKLOG"),
  priority: taskPriorityEnum("priority").notNull().default("LOW"),
  ...timestamps,
}));
