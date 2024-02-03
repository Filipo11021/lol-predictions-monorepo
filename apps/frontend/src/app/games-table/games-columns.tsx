'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/ui';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

function getResult({
	vote,
	winner,
}: {
	vote?: { code?: string; score?: string };
	winner: { code: string | null; score: string | null };
}): 'won' | 'lose' | 'wonWithScore' | 'unfinished' {
	if (!(winner.code || winner.score)) return 'unfinished';

	if (winner.code !== vote?.code) return 'lose';
	if (vote?.score === winner.score || vote.score === '1-0')
		return 'wonWithScore';
	return 'won';
}

export type GamesTableInfo = Record<
	`team${number}`,
	{
		teams: Array<string>;
		winner: { code: string | null; score: string | null };
	}
>;

export type GamesTableData = {
	username: string;
	points: number;
} & Record<`team${number}`, { score: string; code: string }>;

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
}): ColumnDef<GamesTableData, { code: string; score: string } | string>[] => {
	const cols: ColumnDef<GamesTableData, { code: string; score: string }>[] = [];

	for (const key in tableInfo) {
		if (!isKeyOf(tableInfo, key)) continue;
		const { teams, winner } = tableInfo[key];
		cols.push({
			accessorKey: key,
			header: () => {
				return (
					<div className="min-w-20 text-center">
						{teams[0]} vs {teams[1]}
					</div>
				);
			},
			cell(props) {
				const value = props.getValue();
				const resultStatus = getResult({ winner, vote: value });
				return (
					<div
						className={cn('p-4 font-medium text-center h-full border-x', {
							'bg-success text-success-foreground':
								resultStatus === 'wonWithScore',
							'bg-error text-error-foreground': resultStatus === 'lose',
							'bg-warning text-warning-foreground': resultStatus === 'won',
						})}
					>
						{value?.code} {value?.score !== '1-0' && value?.score}
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
				return (
					<div className="p-4 border-t mt-[-1px]">
						{props.getValue() as string}
					</div>
				);
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
		//@ts-expect-error
		...cols,
	];
};
