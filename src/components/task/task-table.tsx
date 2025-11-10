"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { memo, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AssignStatusDialog } from "@/components/task/assign-status-dialog";
import { AssignUserDialog } from "@/components/task/assign-user-dialog";
import { EditTaskDialog } from "@/components/task/edit-task-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTRPC } from "@/shared/helpers/trpc/client";
import { useScopedI18n } from "@/shared/locales/client";
import type { TaskPriority, TaskStatus } from "@/shared/types/tasks";

export function TaskTable(props: {
  filter?: {
    search?: string | null;
    status?: TaskStatus | null;
    priority?: TaskPriority | null;
  };
}) {
  const t = useScopedI18n("task");
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(trpc.tasks.get.queryOptions({}));

  const deleteMutation = useMutation(
    trpc.tasks.delete.mutationOptions({
      onSuccess: async () => {
        toast.success(t("toast.deleted"));
        await queryClient.invalidateQueries({
          queryKey: trpc.tasks.get.queryKey(),
        });
      },
      onError: ({ message }) => {
        toast.error(message ?? t("toast.delete_error"));
      },
    }),
  );

  // === SORTING ===
  const [sortColumn, setSortColumn] = useState<keyof RowTask>("title");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const search = props.filter?.search?.toLowerCase().trim();
  const filteredData: RowTask[] = useMemo(() => {
    if (!data) return [] as RowTask[];
    if (!search) return data;
    return (data as RowTask[]).filter(
      (t) =>
        (t.title?.toLowerCase().includes(search as string) ?? false) ||
        (t.description?.toLowerCase().includes(search as string) ?? false) ||
        (t.userName?.toLowerCase().includes(search as string) ?? false),
    );
  }, [data, search]);

  const sortedData = useMemo(() => {
    const base = filteredData;
    const sorted = [...base].sort((a, b) => {
      const aVal = a[sortColumn] ?? "";
      const bVal = b[sortColumn] ?? "";
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredData, sortColumn, sortDirection]);

  const toggleSort = (column: keyof RowTask) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // === PAGINATION ===
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  // === RENDER ===
  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-center text-sm text-muted-foreground">
          {t("loading")}
        </p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-6">
        <p className="text-center text-sm text-muted-foreground">
          {t("empty")}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 w-full overflow-hidden">
      <Table className="w-full border rounded-xl shadow-sm">
        <TableHeader>
          <TableRow>
            <TableHead
              onClick={() => toggleSort("id")}
              className="cursor-pointer"
            >
              ID <ArrowUpDown className="ml-1 inline h-3 w-3" />
            </TableHead>
            <TableHead
              onClick={() => toggleSort("title")}
              className="cursor-pointer"
            >
              {t("title")} <ArrowUpDown className="ml-1 inline h-3 w-3" />
            </TableHead>
            <TableHead>{t("description")}</TableHead>
            <TableHead
              onClick={() => toggleSort("userName")}
              className="cursor-pointer"
            >
              {t("username")} <ArrowUpDown className="ml-1 inline h-3 w-3" />
            </TableHead>
            <TableHead
              onClick={() => toggleSort("status")}
              className="cursor-pointer"
            >
              {t("status")} <ArrowUpDown className="ml-1 inline h-3 w-3" />
            </TableHead>
            <TableHead
              onClick={() => toggleSort("priority")}
              className="cursor-pointer"
            >
              {t("priority")} <ArrowUpDown className="ml-1 inline h-3 w-3" />
            </TableHead>
            <TableHead className="text-right">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {paginatedData.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onDelete={(id) => deleteMutation.mutate({ id })}
            />
          ))}
        </TableBody>
      </Table>

      {/* PAGINATION */}
      <div className="mt-4 flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              />
            </PaginationItem>
            <PaginationItem className="px-3 py-1 text-sm">
              {page} / {totalPages}
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}

type RowTask = {
  id: string;
  title: string;
  description: string | null;
  userName: string | null;
  status: string;
  priority: string;
};

const TaskRow = function TaskRow(props: {
  task: RowTask;
  onDelete: (id: string) => void;
}) {
  const t = useScopedI18n("task");
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);
  const [openAssignStatus, setOpenAssignStatus] = useState(false);

  const { task } = props;
  const searchParams = useSearchParams();

  // Sync open state with ?id= in the URL to avoid flip-flopping on navigation
  useEffect(() => {
    const shouldBeOpen = searchParams.get("id") === task.id;
    setOpenEdit(shouldBeOpen);
  }, [searchParams, task.id]);

  return (
    <TableRow>
      <TableCell className="w-[120px] truncate font-mono text-xs">
        {task.id}
      </TableCell>
      <TableCell>{task.title}</TableCell>
      <TableCell className="max-w-[250px] truncate">
        {task.description}
      </TableCell>
      <TableCell>{task.userName ?? "-"}</TableCell>
      <TableCell>{task.status}</TableCell>
      <TableCell>{task.priority}</TableCell>
      <TableCell className="w-[60px] text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={t("actions")}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setOpenEdit(true)}>
              <Pencil className="mr-2 h-4 w-4" /> {t("edit")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setOpenAssign(true)}>
              <Pencil className="mr-2 h-4 w-4" /> {t("assign")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setOpenAssignStatus(true)}>
              <Pencil className="mr-2 h-4 w-4" /> {t("status")}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onSelect={() => setOpenDelete(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> {t("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <EditTaskDialog
          task={task}
          open={openEdit}
          onOpenChange={setOpenEdit}
        />
        <AssignUserDialog
          taskId={task.id}
          open={openAssign}
          onOpenChange={setOpenAssign}
        />
        <AssignStatusDialog
          taskId={task.id}
          open={openAssignStatus}
          onOpenChange={setOpenAssignStatus}
        />

        <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("confirmDelete.title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("confirmDelete.description")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button
                  variant="destructive"
                  onClick={() => props.onDelete(task.id)}
                >
                  {t("delete")}
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
};
