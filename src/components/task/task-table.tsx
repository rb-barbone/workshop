"use client";

import { useTRPC } from "@/shared/helpers/trpc/client";
import { useScopedI18n } from "@/shared/locales/client";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, Pencil } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { EditTaskDialogButton } from "@/components/task/edit-task-dialog-button";
import { AssignUserDialog } from "@/components/task/assign-user-dialog";
import { AssignStatusDialog } from "@/components/task/assign-status-dialog";
import { useState, memo } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function TaskTable(props: { filter?: { title?: string | null; description?: string | null; status?: string | null; priority?: string | null; } }) {
  const t = useScopedI18n("task");
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    trpc.tasks.get.queryOptions({
      title: props.filter?.title ?? null,
      description: props.filter?.description ?? null,
      status: (props.filter?.status as any) ?? null,
      priority: (props.filter?.priority as any) ?? null,
    }),
  );

  // Define mutations BEFORE any conditional returns to keep hooks order stable
  const deleteMutation = useMutation(
    trpc.tasks.delete.mutationOptions({
      onSuccess: async () => {
        toast.success(t("toast.deleted"));
        await queryClient.invalidateQueries();
      },
      onError: ({ message }) => {
        toast.error(message ?? t("toast.delete_error"));
      },
    }),
  );

  if (isLoading) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={8}>{t("loading")}</TableCell>
        </TableRow>
      </TableBody>
    );
  }

  if (!data || data.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={8}>{t("empty")}</TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {data.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          onDelete={(id) => deleteMutation.mutate({ id })}
        />
      ))}
    </TableBody>
  );
}

type RowTask = { id: string; title: string; description: string | null; userName: string | null; status: string; priority: string };

const TaskRow = memo(function TaskRow(props: {
  task: RowTask;
  onDelete: (id: string) => void;
}) {
  const t = useScopedI18n("task");
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);
  const [openAssignStatus, setOpenAssignStatus] = useState(false);

  const { task } = props;

  return (
    <TableRow>
      <TableCell className="w-[120px] max-w-[120px] truncate font-mono text-xs">{task.id}</TableCell>
      <TableCell>{task.title}</TableCell>
      <TableCell>{task.description}</TableCell>
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
            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setOpenEdit(true); }}>
              <Pencil className="mr-2 h-4 w-4" /> {t("edit")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setOpenAssign(true); }}>
              <Pencil className="mr-2 h-4 w-4" /> {t("assign")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setOpenAssignStatus(true); }}>
              <Pencil className="mr-2 h-4 w-4" /> {t("status")}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600 focus:text-red-600" onSelect={(e) => { e.preventDefault(); setOpenDelete(true); }}>
              <Trash2 className="mr-2 h-4 w-4" /> {t("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Edit dialog rendered outside menu to avoid unmount on close */}
        <EditTaskDialogButton task={task} open={openEdit} onOpenChange={setOpenEdit} />

        {/* Assign user dialog */}
        <AssignUserDialog taskId={task.id} open={openAssign} onOpenChange={setOpenAssign} />

        {/* Assign status dialog */}
        <AssignStatusDialog taskId={task.id} open={openAssignStatus} onOpenChange={setOpenAssignStatus} />

        {/* Delete confirm dialog rendered outside menu */}
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
                <Button variant="destructive" onClick={() => props.onDelete(task.id)}>
                  {t("delete")}
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
});

