import { pgEnum, index } from "drizzle-orm/pg-core";

import { timestamps } from "../utils";
import { createTable } from "./_table";
import { user } from "./auth-schema";
import { TASK_STATUS, TASK_PRIORITIES } from "@/shared/types/tasks";

const taskStatusEnum = pgEnum("task_status", TASK_STATUS);
const taskPriorityEnum = pgEnum("task_priority", TASK_PRIORITIES);

export const task_table = createTable(
  "task_table",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey().notNull(),
    title: d.varchar({ length: 256 }).notNull(),
    description: d.text().notNull(),
    userId: d.integer('user_id').references(() => user.id),
    status: taskStatusEnum("status").notNull().default("BACKLOG"),
    priority: taskPriorityEnum("priority").notNull().default("LOW"),
    ...timestamps,
  }),
);