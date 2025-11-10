"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import type z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useScopedI18n } from "@/shared/locales/client";
import { TASK_PRIORITIES } from "@/shared/types/tasks";
import { taskFormSchema } from "@/shared/validators/task.schema";

export type TaskFormValues = z.infer<typeof taskFormSchema>;

export function TaskFormDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titleKey: string;
  trigger?: React.ReactNode;
  initialValues?: TaskFormValues;
  isSubmitting?: boolean;
  onSubmit: (values: TaskFormValues) => void;
}) {
  const t = useScopedI18n("task");

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: props.initialValues?.title ?? "",
      description: props.initialValues?.description ?? "",
      priority: props.initialValues?.priority ?? "LOW",
    },
  });

  // Reset form quando il dialog si apre o cambiano i valori iniziali
  useEffect(() => {
    if (props.open) {
      form.reset({
        title: props.initialValues?.title ?? "",
        description: props.initialValues?.description ?? "",
        priority: props.initialValues?.priority ?? "LOW",
      });
    }
  }, [
    props.open,
    props.initialValues?.title,
    props.initialValues?.description,
    props.initialValues?.priority,
    form,
  ]);

  const handleSubmit = (values: TaskFormValues) => {
    // Clean up empty strings to undefined for description
    props.onSubmit({
      ...values,
      description: values.description?.trim() || undefined,
      title: values.title.trim(),
    });
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      {props.trigger ? (
        <DialogTrigger asChild>{props.trigger}</DialogTrigger>
      ) : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t(props.titleKey as Parameters<typeof t>[0])}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid gap-4 py-4">
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label htmlFor="task-title">{t("title")}</Label>
                  <Input
                    id="task-title"
                    {...field}
                    aria-invalid={fieldState.invalid}
                    placeholder={t("title")}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label htmlFor="task-description">{t("description")}</Label>
                  <Textarea
                    id="task-description"
                    {...field}
                    aria-invalid={fieldState.invalid}
                    placeholder={t("description")}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="priority"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label htmlFor="task-priority">{t("priority")}</Label>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="task-priority">
                      <SelectValue placeholder={t("priority")} />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={props.isSubmitting}>
              {t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
