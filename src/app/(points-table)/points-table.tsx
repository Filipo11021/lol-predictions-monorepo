"use client";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import {
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { SearchIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { columns } from "./points-columns";
import type { PointsTableData } from "./points-columns";

function usePointsTable(data: Array<PointsTableData>) {
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "points", desc: true },
	]);

	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
		{ id: "username", value: "" },
	]);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),

		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,

		getFilteredRowModel: getFilteredRowModel(),
		onColumnFiltersChange: setColumnFilters,

		state: {
			sorting,
			columnFilters,
		},
	});

	function handleUsernameFilter(value: string) {
		table.getColumn("username")?.setFilterValue(value ?? "");
	}
	const usernameFilter = (() => {
		const value = table.getColumn("username")?.getFilterValue();
		return typeof value === "string" ? value : "";
	})();

	return {
		table,
		usernameFilter: {
			value: usernameFilter,
			handler: handleUsernameFilter,
		},
	};
}

export function PointsTable({ data }: { data: Array<PointsTableData> }) {
	const { table, usernameFilter } = usePointsTable(data);

	return (
		<div className="flex flex-col gap-6">
			<div className="flex gap-2 justify-center items-center">
				<SearchIcon />
				<Input
					onInput={(e) => usernameFilter.handler(e.currentTarget.value)}
					value={usernameFilter.value}
					placeholder="Search by username"
					type="search"
				/>
				<Button
					variant="ghost"
					className=""
					onClick={() => usernameFilter.handler("")}
				>
					<span className="sr-only">clear username filter</span>
					<XIcon />
				</Button>
			</div>
			<DataTable table={table} />
		</div>
	);
}
