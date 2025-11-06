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
            <div className="flex flex-raw justify-between p-4">
                <Search>Search</Search>
                <AddTaskDialogButton />
            </div>
            <Table className="w-full mx-2">
                <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">{t("id")}</TableHead>
                      <TableHead>{t("title")}</TableHead>
                      <TableHead>{t("description")}</TableHead>
                      <TableHead>{t("username")}</TableHead>
                      <TableHead>{t("status")}</TableHead>
                      <TableHead>{t("priority")}</TableHead>
                      <TableHead className="w-[60px] text-right">{t("actions")}</TableHead>
                    </TableRow>
                </TableHeader>
                <TaskTable filter={filter} />
            </Table>
          </div>
          
        </HydrateClient>
      );
}