'use client';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from '@/components/ui/card';
import Image from 'next/image';
import { selectPickAction } from './select-pick';
import { useRef, useState } from 'react';
import { cn } from '@/utils/ui';
import type { Translation } from '@/i18n/i18n';
import { Loader2 } from 'lucide-react';

export function ChooseAnswer({
	options,
	title,
	questionId,
	points,
	selectedOption,
	translation,
}: {
	questionId: string;
	title: string;
	options: {
		value: string;
		image?: string;
		title?: string;
		subtitle?: string;
	}[];
	points: number;
	selectedOption?: string;
	translation: Translation['pick'];
}) {
	const lastSubmittedValue = useRef<undefined | string>(selectedOption);
	const [value, setValue] = useState<string | undefined>(selectedOption);
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<null | string>(null);

	async function confirmPickHandler() {
		setError(null);

		if (!value) {
			return setError('unknown');
		}

		try {
			setIsLoading(true);
			const val = value;
			const { ok } = await selectPickAction({ questionId, value });
			if (!ok) return setError('unknown');

			lastSubmittedValue.current = val;
			setIsOpen(false);
		} catch {
			setError('unknown');
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<Dialog
			onOpenChange={(open) => {
				if (value !== lastSubmittedValue.current && open === false) {
					setValue(lastSubmittedValue.current);
				}

				setIsOpen(open);
			}}
			open={isOpen}
		>
			<Card className="flex flex-col justify-between">
				<div>
					<CardHeader>
						<div className="relative flex flex-col">
							<img
								alt=""
								src={
									options.find((opt) => opt.value === value)?.image
										? options.find((opt) => opt.value === value)?.image
										: 'https://upload.wikimedia.org/wikipedia/en/e/e7/LOL_MSI_logo.svg'
								}
							/>
							{value ? (
								<div className="bg-black/40 capitalize  text-base font-semibold p-2 w-full text-center absolute bottom-0 left-0">
									{value}
								</div>
							) : null}
						</div>
					</CardHeader>
					<CardContent className="text-center">{title}</CardContent>
				</div>

				<CardFooter className="flex flex-col items-center gap-4">
					<div className="px-3 rounded-md py-2 text-base border-2 border-yellow-500 text-yellow-500">
						{points} PTS
					</div>
					<DialogTrigger asChild>
						<Button size="lg" variant={value ? 'outline' : 'default'}>
							{value ? translation.change : translation.make}
						</Button>
					</DialogTrigger>
				</CardFooter>
			</Card>
			<DialogContent className="max-w-6xl w-11/12">
				<DialogHeader>
					<DialogTitle className="font-light text-2xl">{title}</DialogTitle>
				</DialogHeader>

				<div
					className={cn(
						'grid grid-cols-2 sm:grid-cols-3 gap-8 py-4 px-3 max-h-[70dvh] overflow-y-scroll',
						{
							'grid-cols-1': options.some(({ image }) => image),
						}
					)}
				>
					{options.map((answer) => (
						<Button
							onClick={() => setValue(answer.value)}
							className={cn(
								'cursor-pointer border overflow-hidden flex justify-start gap-4 capitalize border-border px-8 py-10  rounded-md text-base',
								{
									'border-primary': value === answer.value,
								}
							)}
							variant="ghost"
						>
							{answer?.image ? (
								<Image alt="" src={answer.image} width={85} height={85} />
							) : null}
							<div className='flex flex-col justify-center items-start'>
								{answer.subtitle && (
									<p className="text-sm font-light mb-1">{answer.subtitle}</p>
								)}
								<p className='text-lg'>{answer?.title ?? answer.value}</p>
							</div>
						</Button>
					))}
				</div>
				<DialogFooter className="flex gap-8 items-center">
					{error && (
						<div className="font-light text-yellow-400">
							{translation.error.title}
						</div>
					)}
					<Button
						disabled={!value || isLoading}
						onClick={confirmPickHandler}
						type="submit"
						size="lg"
						className="uppercase"
					>
						{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						{translation.confirm}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
