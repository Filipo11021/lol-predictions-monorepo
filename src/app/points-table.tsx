"use client";

import { Input } from "@/components/ui/input";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { SearchIcon } from "lucide-react";
import { useCallback, useState } from "react";
import debounce from "lodash.debounce";

export function PointsTable({
  data,
}: {
  data: Array<{ username: string; points: number }>;
}) {
  const [query, setQuery] = useState("");

  const tableData = data.filter(({ username }) =>
    username.toLocaleLowerCase().includes(query.toLocaleLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 justify-center items-center">
        <SearchIcon />
        <Input
          onInput={(e) => setQuery(e.currentTarget.value)}
          placeholder="Search by username"
          value={query}
        />
      </div>
      <DataTable data={tableData} columns={columns} />
    </div>
  );
}
