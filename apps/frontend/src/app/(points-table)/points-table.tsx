'use client';

import { TableSearch } from '@/app/shared/table-search';
import { DataTable } from '@/components/ui/data-table';
import type { GameDay } from '@repo/database';
import {
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';
import type { ColumnFiltersState, SortingState } from '@tanstack/react-table';
import { useState } from 'react';
import { columns } from './points-columns';
import type { PointsTableData } from './points-columns';

function usePointsTable(data: Array<PointsTableData>) {
	const [sorting, setSorting] = useState<SortingState>([
		{ id: 'points', desc: true },
	]);

	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
		{ id: 'username', value: '' },
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
		table.getColumn('username')?.setFilterValue(value ?? '');
	}
	const usernameFilter = (() => {
		const value = table.getColumn('username')?.getFilterValue();
		return typeof value === 'string' ? value : '';
	})();

	return {
		table,
		usernameFilter: {
			value: usernameFilter,
			handler: handleUsernameFilter,
		},
	};
}

export function PointsTable({
	data,
	gameDays,
}: { data: Array<PointsTableData>; gameDays: GameDay[] }) {
	const { table, usernameFilter } = usePointsTable(data);

	return (
		<div className="flex flex-col gap-6">
			<TableSearch gameDays={gameDays} usernameFilter={usernameFilter} />
			<DataTable table={table} />
		</div>
	);
}
