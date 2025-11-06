"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useScopedI18n } from "@/shared/locales/client";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TASK_PRIORITIES, type TaskPriority } from "@/shared/types/tasks";

export type TaskFormValues = {
  title: string;
  description?: string;
  priority: TaskPriority;
};

export function TaskFormDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titleKey: string; // i18n key for dialog title
  trigger?: React.ReactNode;
  initialValues?: TaskFormValues;
  isSubmitting?: boolean;
  onSubmit: (values: TaskFormValues) => void;
}) {
  const t = useScopedI18n("task");
  const [title, setTitle] = useState(props.initialValues?.title ?? "");
  const [description, setDescription] = useState(props.initialValues?.description ?? "");
  const [priority, setPriority] = useState<TaskPriority>(props.initialValues?.priority ?? "LOW");

  useEffect(() => {
    if (props.open) {
      setTitle(props.initialValues?.title ?? "");
      setDescription(props.initialValues?.description ?? "");
      setPriority((props.initialValues?.priority as TaskPriority) ?? "LOW");
    }
  }, [props.open, props.initialValues?.title, props.initialValues?.description]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    props.onSubmit({ title: title.trim(), description: description.trim() || undefined, priority });
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      {props.trigger ? <DialogTrigger asChild>{props.trigger}</DialogTrigger> : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(props.titleKey as any)}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="task-title">{t("title")}</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("title")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="task-description">{t("description")}</Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("description")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="task-priority">{t("priority")}</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
              <SelectTrigger id="task-priority">
                <SelectValue placeholder={t("priority")} />
              </SelectTrigger>
              <SelectContent>
                {TASK_PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={props.isSubmitting}>
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


