"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { TaskFormDialog } from "@/components/task/task-form-dialog";
import { Button } from "@/components/ui/button";
import { useUserQuery } from "@/hooks/use-user";
import { useTRPC } from "@/shared/helpers/trpc/client";
import { useScopedI18n } from "@/shared/locales/client";

export function AddTaskDialog() {
  const t = useScopedI18n("task");
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: currentUser } = useUserQuery();

  const [open, setOpen] = useState(false);

  const upsertMutation = useMutation(
    trpc.tasks.upsert.mutationOptions({
      onSuccess: async () => {
        toast.success(t("toast.created"));
        setOpen(false);
        await queryClient.invalidateQueries();
      },
      onError: ({ message }) => {
        toast.error(message ?? t("toast.create_error"));
      },
    }),
  );

  const onSave = (values: {
    title: string;
    description?: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
  }) => {
    upsertMutation.mutate({
      id: crypto.randomUUID(),
      title: values.title,
      description: values.description,
      priority: values.priority,
      userId: currentUser?.id ?? null,
    });
  };

  return (
    <TaskFormDialog
      open={open}
      onOpenChange={setOpen}
      titleKey="addTask"
      trigger={<Button>{t("addTask")}</Button>}
      isSubmitting={upsertMutation.isPending}
      onSubmit={onSave}
    />
  );
}
