import "dotenv/config";

import { reset, seed } from "drizzle-seed";

import { db } from ".";
import { schema } from "./schema";
import { task_table } from "./schema/tasks";
import { todo_table } from "./schema/todos";

async function main() {
  await reset(db, schema);
  await seed(db, { todo_table, task_table }).refine((f) => ({
    todo_table: {
      columns: {
        text: f.loremIpsum(),
      },
      count: 5,
    },
    task_table: {
      columns: {
        title: f.loremIpsum(),
        description: f.loremIpsum(),
        completed: f.boolean(),
      },
      count: 5,
    },
  }));

  await db.$client.end();
}

await main();
