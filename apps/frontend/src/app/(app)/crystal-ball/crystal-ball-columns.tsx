'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/ui';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

export function getResult({
	correctOptions,
  selectedOptions
}: {
  selectedOptions?: string[];
	correctOptions?: string[];
}): 'won' | 'lose' | 'unfinished' {
	if (!selectedOptions || !correctOptions) return 'unfinished';

  if (selectedOptions.some((el) => correctOptions.includes(el))) return 'won'

  return 'lose'
}

export type BonusQuestionsInfo = Record<
`questionId-${string}`,
	{
		title: string,
    correctOptions?: string[]
	}
>;

export type BonusQuestionsData = {
	username: string;
	points: number;
} & Record<`questionId-${string}`, string[]>;

function isKeyOf<Obj extends object>(
	obj: Obj,
	key: PropertyKey
): key is keyof Obj {
	return key in obj;
}

export const getColumns = ({
	tableInfo,
}: {
	tableInfo: BonusQuestionsInfo;
}): ColumnDef<BonusQuestionsData, string>[] => {
	const cols: ColumnDef<BonusQuestionsData, string[]>[] = [];

	for (const key in tableInfo) {
		if (!isKeyOf(tableInfo, key)) continue;

		const {title, correctOptions} = tableInfo[key];
		cols.push({
			accessorKey: key,
			header: () => {
				return (
					<div className="min-w-20 text-center">
						{title}
					</div>
				);
			},
			cell(props) {
				const selectedOptions = props.getValue();
				const resultStatus = getResult({correctOptions, selectedOptions});
				return (
					<div
						className={cn('h-full border-x p-4 text-center font-medium', {
							'bg-error text-error-foreground': resultStatus === 'lose',
							'g-success text-success-foreground': resultStatus === 'won',
						})}
					>
						{selectedOptions}
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
					<div className="mt-[-1px] border-t p-4">
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
						className="mx-auto flex text-center"
						onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
					>
						Points
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell({ getValue }) {
				return <div className="p-4 text-center">{Number(getValue())}</div>;
			},
		},
		//@ts-expect-error
		...cols,
	];
};
