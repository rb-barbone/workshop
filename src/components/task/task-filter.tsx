"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useScopedI18n } from "@/shared/locales/client";
import { TASK_PRIORITIES, TASK_STATUS } from "@/shared/types/tasks";

export function TaskFilter() {
  const t = useScopedI18n("task");
  const router = useRouter();
  const params = useSearchParams();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [priority, setPriority] = useState<string>("");

  useEffect(() => {
    setSearch(params.get("search") ?? "");
    setStatus(params.get("status") ?? "");
    setPriority(params.get("priority") ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const apply = () => {
    const qs = new URLSearchParams();
    if (search.trim()) qs.set("search", search.trim());
    if (status) qs.set("status", status);
    if (priority) qs.set("priority", priority);
    router.push(`?${qs.toString()}`);
  };

  const reset = () => {
    setSearch("");
    setStatus("");
    setPriority("");
    router.push("?");
  };

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="flex-1 min-w-[220px]">
        <Input
          placeholder={t("title")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="min-w-[180px]">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
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
      <div className="min-w-[180px]">
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger>
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
      </div>
      <Button variant="outline" onClick={reset}>
        {t("cancel")}
      </Button>
      <Button onClick={apply}>{t("confirm")}</Button>
    </div>
  );
}
