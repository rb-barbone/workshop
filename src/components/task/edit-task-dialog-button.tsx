"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/shared/helpers/trpc/client";
import { useScopedI18n } from "@/shared/locales/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TaskFormDialog } from "@/components/task/task-form-dialog";
import { useUserQuery } from "@/hooks/use-user";

type EditTaskDialogButtonProps = {
  task: { id: string; title: string; description: string | null; priority: string };
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function EditTaskDialogButton(props: EditTaskDialogButtonProps) {
  const t = useScopedI18n("task");
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: currentUser } = useUserQuery();

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

  const onSave = (values: { title: string; description?: string; priority: "LOW" | "MEDIUM" | "HIGH" }) => {
    upsertMutation.mutate({
      id: props.task.id,
      title: values.title,
      description: values.description,
      priority: values.priority,
      userId: null,
    });
  };

  return (
    <TaskFormDialog
      open={open}
      onOpenChange={setOpen}
      titleKey="edit"
      initialValues={{ title: props.task.title, description: props.task.description ?? "", priority: props.task.priority as any }}
      isSubmitting={upsertMutation.isPending}
      onSubmit={onSave}
    />
  );
}


