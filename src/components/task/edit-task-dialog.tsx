"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TaskFormDialog } from "@/components/task/task-form-dialog";
import { useTRPC } from "@/shared/helpers/trpc/client";
import { useScopedI18n } from "@/shared/locales/client";

type EditTaskDialogProps = {
  task: {
    id: string;
    title: string;
    description: string | null;
    priority: string;
  };
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function EditTaskDialog(props: EditTaskDialogProps) {
  const t = useScopedI18n("task");
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled =
    props.open !== undefined && props.onOpenChange !== undefined;
  const open = isControlled ? (props.open as boolean) : internalOpen;
  const setOpen = isControlled
    ? (props.onOpenChange as (o: boolean) => void)
    : setInternalOpen;

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

  const onSave = (values: {
    title: string;
    description?: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
  }) => {
    upsertMutation.mutate({
      id: props.task.id,
      title: values.title,
      description: values.description,
      priority: values.priority,
      userId: null,
    });
  };

  // Keep URL in sync with dialog open state when editing from the action menu
  useEffect(() => {
    if (!pathname) return;
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (open) {
      params.set("id", props.task.id);
    } else {
      params.delete("id");
    }
    const next = `${pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    router.replace(next, { scroll: false });
    // Intentionally exclude searchParams from deps to avoid loops; we drive from `open`
  }, [open, pathname, router, props.task.id]);

  return (
    <TaskFormDialog
      open={open}
      onOpenChange={setOpen}
      titleKey="edit"
      initialValues={{
        title: props.task.title,
        description: props.task.description ?? "",
        priority: props.task.priority as "LOW" | "MEDIUM" | "HIGH",
      }}
      isSubmitting={upsertMutation.isPending}
      onSubmit={onSave}
    />
  );
}
