'use client';

import { TableSearch } from '@/app/(app)/shared/table-search';
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
import { BonusQuestionsData, BonusQuestionsInfo, getColumns } from './bonus-questions-columns';

function useBonusQuestion({
	tableData,
	tableInfo,
}: { tableData: Array<BonusQuestionsData>; tableInfo: BonusQuestionsInfo }) {
	const [sorting, setSorting] = useState<SortingState>([
		{ id: 'points', desc: true },
	]);

	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
		{ id: 'username', value: '' },
	]);

	const table = useReactTable({
		data: tableData,
		columns: getColumns({ tableInfo }),
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

export function BonusQuestionTable({
	tableData,
	tableInfo,
	gameDays,
}: {
	tableData: Array<BonusQuestionsData>;
	tableInfo: BonusQuestionsInfo;
	gameDays: GameDay[];
}) {
	const { table, usernameFilter } = useBonusQuestion({ tableData, tableInfo });

	return (
		<div className="flex flex-col gap-6">
			<TableSearch gameDays={gameDays} usernameFilter={usernameFilter} />
			<DataTable className={{ cell: 'p-0' }} table={table} />
			<style jsx>{`
:global(td:nth-of-type(1)),
:global(th:nth-of-type(1)) {
  position: sticky;
  left: 0;
  top: 0;
}
			`}</style>
		</div>
	);
}
