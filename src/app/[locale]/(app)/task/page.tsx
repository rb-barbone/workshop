import { Button } from "@/components/ui/button";
import {
    Table,
    TableHead,
    TableHeader,
    TableRow,
    TableCell,
  } from "@/components/ui/table"
import { HydrateClient } from '@/shared/helpers/trpc/server';
import { getScopedI18n } from '@/shared/locales/server';
import { Search } from "lucide-react";
import type { SearchParams } from 'nuqs/server';
import { createLoader } from "nuqs/server";
import { taskFilterParamsSchema } from "@/shared/validators/task.schema";
import { TaskTable } from "@/components/task/task-table";
import { AddTaskDialogButton } from "@/components/task/add-task-dialog-button";
import { TaskFilter } from "@/components/task/task-filter";

type TaskPageProps = {
    searchParams: Promise<SearchParams>;
}

export default async function TaskPage(props: TaskPageProps) {
    const t = await getScopedI18n("task");
    const searchParams = await props.searchParams;
    const loadTaskFilterParams = createLoader(taskFilterParamsSchema);
    const filter = loadTaskFilterParams(searchParams);

    return (
        <HydrateClient>
          <div>
            <div className="flex flex-raw justify-between p-4 gap-4 items-center">
                <TaskFilter />
                <AddTaskDialogButton />
            </div>
            <TaskTable filter={{
              status: (filter.status as any) ?? null,
              priority: (filter.priority as any) ?? null,
              search: (filter as any).search ?? null,
            }}/>
          </div>
          
        </HydrateClient>
    );
}