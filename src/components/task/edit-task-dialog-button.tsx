"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/shared/helpers/trpc/client";
import { useScopedI18n } from "@/shared/locales/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TaskFormDialog } from "@/components/task/task-form-dialog";

type EditTaskDialogButtonProps = {
  task: { id: string; title: string; description: string | null };
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function EditTaskDialogButton(props: EditTaskDialogButtonProps) {
  const t = useScopedI18n("task");
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = props.open !== undefined && props.onOpenChange !== undefined;
  const open = isControlled ? (props.open as boolean) : internalOpen;
  const setOpen = isControlled ? (props.onOpenChange as (o: boolean) => void) : setInternalOpen;

  const upsertMutation = useMutation(
    trpc.tasks.upsert.mutationOptions({
      onSuccess: async () => {
        toast.success(t("toast.updated"));
        setOpen(false);
        await queryClient.invalidateQueries();
      },
      onError: ({ message }) => {
        toast.error(message ?? t("toast.update_error"));
      },
    }),
  );

  const onSave = (values: { title: string; description?: string }) => {
    upsertMutation.mutate({
      id: props.task.id,
      title: values.title,
      description: values.description,
    });
  };

  return (
    <TaskFormDialog
      open={open}
      onOpenChange={setOpen}
      titleKey="edit"
      trigger={props.children ?? <Button variant="ghost">{t("edit")}</Button>}
      initialValues={{ title: props.task.title, description: props.task.description ?? "" }}
      isSubmitting={upsertMutation.isPending}
      onSubmit={onSave}
    />
  );
}


