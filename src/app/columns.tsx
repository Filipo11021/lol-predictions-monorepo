"use client";

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

export const columns: ColumnDef<{
  username: string;
  points: number;
  coverage: number;
  index: number;
}>[] = [
  {
    accessorKey: "index",
    header: () => {
      return <div>#</div>;
    },
  },
  {
    accessorKey: "username",
    header: () => {
      return <div>Username</div>;
    },
  },
  {
    accessorKey: "points",
    id: "points",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="text-center flex mx-auto"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Points
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell({ getValue }) {
      return <div className="text-center">{Number(getValue())}</div>;
    },
  },
  {
    accessorKey: "coverage",
    id: "coverage",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="text-center flex mx-auto"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Coverage
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell({ getValue }) {
      return (
        <div className="text-center">{Math.round(Number(getValue()))}%</div>
      );
    },
  },
];
