"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/shared/helpers/trpc/client";
import { useScopedI18n } from "@/shared/locales/client";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type AssignUserDialogProps = {
  taskId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AssignUserDialog(props: AssignUserDialogProps) {
  const t = useScopedI18n("task");
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: users } = useQuery(trpc.user.list.queryOptions());
  const [query, setQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (props.open) {
      setQuery("");
      setSelectedUserId(null);
    }
  }, [props.open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users ?? [];
    return (users ?? []).filter((u) => u.name.toLowerCase().includes(q));
  }, [users, query]);

  const assignMutation = useMutation(
    trpc.tasks.assignUser.mutationOptions({
      onSuccess: async () => {
        toast.success(t("toast.updated"));
        await queryClient.invalidateQueries();
        props.onOpenChange(false);
      },
      onError: ({ message }) => {
        toast.error(message ?? t("toast.update_error"));
      },
    })
  );

  const handleConfirm = () => {
    assignMutation.mutate({ id: props.taskId, userId: selectedUserId });
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("assign")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          <Input
            placeholder={t("username")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleConfirm();
              }
            }}
          />
          <div className="max-h-60 overflow-auto rounded-md border">
            {filtered.map((u) => (
              <button
                key={u.id}
                type="button"
                className={`w-full text-left px-3 py-2 hover:bg-accent ${selectedUserId === u.id ? "bg-accent/50" : ""}`}
                onClick={() => setSelectedUserId(u.id)}
              >
                {u.name}
              </button>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleConfirm} disabled={assignMutation.isPending}>
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


