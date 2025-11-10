"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTRPC } from "@/shared/helpers/trpc/client";

export function UsersTable(props: {
  filter?: { name?: string | null; email?: string | null };
}) {
  const trpc = useTRPC();

  const { data } = useQuery(trpc.user.list.queryOptions());

  type RowUser = { id: string; name: string; email: string };

  const filteredData = useMemo(() => {
    const list = (data ?? []) as RowUser[];
    const name = props.filter?.name?.toLowerCase() ?? "";
    const email = props.filter?.email?.toLowerCase() ?? "";
    return list.filter(
      (u) =>
        (name ? u.name.toLowerCase().includes(name) : true) &&
        (email ? u.email.toLowerCase().includes(email) : true),
    );
  }, [data, props.filter?.name, props.filter?.email]);

  const [sortColumn, setSortColumn] = useState<keyof RowUser>("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const sortedData = useMemo(() => {
    const list = [...filteredData];
    list.sort((a, b) => {
      const av = (a[sortColumn] ?? "").toString();
      const bv = (b[sortColumn] ?? "").toString();
      if (av < bv) return sortDirection === "asc" ? -1 : 1;
      if (av > bv) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredData, sortColumn, sortDirection]);

  const toggleSort = (column: keyof RowUser) => {
    if (column === sortColumn)
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  return (
    <div className="p-6 w-full overflow-hidden">
      <Table className="w-full border rounded-xl shadow-sm">
        <TableHeader>
          <TableRow>
            <TableHead
              onClick={() => toggleSort("id")}
              className="cursor-pointer"
            >
              ID <ArrowUpDown className="ml-1 inline h-3 w-3" />
            </TableHead>
            <TableHead
              onClick={() => toggleSort("name")}
              className="cursor-pointer"
            >
              Name <ArrowUpDown className="ml-1 inline h-3 w-3" />
            </TableHead>
            <TableHead
              onClick={() => toggleSort("email")}
              className="cursor-pointer"
            >
              Email <ArrowUpDown className="ml-1 inline h-3 w-3" />
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {sortedData.map((u) => (
            <TableRow key={u.id}>
              <TableCell className="w-[120px] truncate font-mono text-xs">
                {u.id}
              </TableCell>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
