'use client';

import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import type { GameDay } from '@repo/database';
import { XIcon } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export function TableSearch({
	usernameFilter,
	gameDays,
}: {
	usernameFilter: {
		value: string;
		handler: (value: string) => void;
	};
	gameDays: GameDay[];
}) {
	const { push } = useRouter();
	const path = usePathname();

	return (
		<div className="mx-auto flex w-full max-w-lg items-center justify-center gap-2">
			<ModeToggle />
			<Input
				onInput={(e) => usernameFilter.handler(e.currentTarget.value)}
				value={usernameFilter.value}
				placeholder="Search by username"
				type="search"
			/>
			<Button
				variant="ghost"
				className="mr-3 p-1"
				onClick={() => usernameFilter.handler('')}
			>
				<span className="sr-only">clear username filter</span>
				<XIcon />
			</Button>

			<Select
				onValueChange={(url) => {
					push(url);
				}}
				defaultValue={path}
			>
				<SelectTrigger className="w-[230px]">
					<SelectValue placeholder="View" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={'/'}>points</SelectItem>
					<SelectItem value={'/games-table'}>all games</SelectItem>
					<SelectItem value={'/bonus-questions'}>bonus questions</SelectItem>

					{gameDays.map(({ firstMatchStart, id }) => (
						<SelectItem key={id} value={`/games-table/${id}`}>
							Day: {firstMatchStart.getDate().toString().padStart(2, '0')}-
							{(firstMatchStart.getMonth() + 1).toString().padStart(2, '0')}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
