"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTRPC } from "@/shared/helpers/trpc/client";
import { useScopedI18n } from "@/shared/locales/client";
import { TASK_STATUS, type TaskStatus } from "@/shared/types/tasks";

type AssignStatusDialogProps = {
  taskId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AssignStatusDialog(props: AssignStatusDialogProps) {
  const t = useScopedI18n("task");
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<TaskStatus>("BACKLOG");

  useEffect(() => {
    if (props.open) setStatus("BACKLOG");
  }, [props.open]);

  const mutation = useMutation(
    trpc.tasks.assignStatus.mutationOptions({
      onSuccess: async () => {
        toast.success(t("toast.updated"));
        await queryClient.invalidateQueries({
          queryKey: trpc.tasks.get.queryKey({}),
        });
        props.onOpenChange(false);
      },
      onError: ({ message }) => toast.error(message ?? t("toast.update_error")),
    }),
  );

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("status")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as TaskStatus)}
          >
            <SelectTrigger id="task-status">
              <SelectValue placeholder={t("status")} />
            </SelectTrigger>
            <SelectContent>
              {TASK_STATUS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button
            onClick={() => mutation.mutate({ id: props.taskId, status })}
            disabled={mutation.isPending}
          >
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
