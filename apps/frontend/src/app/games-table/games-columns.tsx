'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/ui';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

export type GamesTableInfo = Record<
	`team${number}`,
	{
		teams: Array<string>;
		winner: { code: string | null };
	}
>;

export type GamesTableData = {
	username: string;
	points: number;
} & Record<`team${number}`, string>;

function isKeyOf<Obj extends object>(
	obj: Obj,
	key: PropertyKey
): key is keyof Obj {
	return key in obj;
}

export const getColumns = ({
	tableInfo,
}: {
	tableInfo: GamesTableInfo;
}): ColumnDef<GamesTableData, string>[] => {
	const cols: ColumnDef<GamesTableData, string>[] = [];

	for (const key in tableInfo) {
		if (!isKeyOf(tableInfo, key)) continue;
		const { teams, winner } = tableInfo[key];
		cols.push({
			accessorKey: key,
			header: () => {
				return (
					<div className="min-w-20">
						{teams[0]} vs {teams[1]}
					</div>
				);
			},
			cell(props) {
				const value = props.getValue();
				return (
					<div
						className={cn('p-4 font-medium text-center h-full border-x', [
							winner.code
								? value === winner.code
									? 'bg-success text-success-foreground'
									: 'bg-error text-error-foreground'
								: 'bg-inherit',
						])}
					>
						{value}
					</div>
				);
			},
		});
	}
	return [
		{
			accessorKey: 'username',
			header: () => {
				return <div>Username</div>;
			},
			cell(props) {
				return <div className="p-4 border-t mt-[-1px]">{props.getValue()}</div>;
			},
		},
		{
			accessorKey: 'points',
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						className="text-center flex mx-auto"
						onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
					>
						Points
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell({ getValue }) {
				return <div className="text-center p-4">{Number(getValue())}</div>;
			},
		},
		...cols,
	];
};
