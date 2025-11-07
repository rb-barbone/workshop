import type { SearchParams } from "nuqs/server";
import { createLoader } from "nuqs/server";
import { AddTaskDialog } from "@/components/task/add-task-dialog";
import { TaskFilter } from "@/components/task/task-filter";
import { TaskTable } from "@/components/task/task-table";
import { HydrateClient } from "@/shared/helpers/trpc/server";
import type { TaskPriority, TaskStatus } from "@/shared/types/tasks";
import { taskFilterParamsSchema } from "@/shared/validators/task.schema";

type TaskPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function TaskPage(props: TaskPageProps) {
  const searchParams = await props.searchParams;
  const loadTaskFilterParams = createLoader(taskFilterParamsSchema);
  const filter = loadTaskFilterParams(searchParams);

  return (
    <HydrateClient>
      <div>
        <div className="flex flex-raw justify-between p-4 gap-4 items-center">
          <TaskFilter />
          <AddTaskDialog />
        </div>
        <TaskTable
          filter={{
            status: (filter.status as TaskStatus) ?? null,
            priority: (filter.priority as TaskPriority) ?? null,
            search: filter.search ?? null,
          }}
        />
      </div>
    </HydrateClient>
  );
}
