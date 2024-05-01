'use client';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import type { Translation } from '@/i18n/i18n';
import { cn } from '@/utils/ui';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { ChooseAnswerSearch } from './choose-answer-search';
import { selectPickAction } from './select-pick';

export function ChooseAnswer({
	options,
	title,
	questionId,
	points,
	initialValue,
	translation,
	isContain,
}: {
	questionId: string;
	title: string;
	options: {
		value: string;
		image?: string;
		title?: string;
		subtitle?: string;
		icon?: string;
	}[];
	points: number;
	initialValue?: string;
	translation: Translation['pick'];
	isContain?: boolean;
}) {
	const lastSubmittedValue = useRef<undefined | string>(initialValue);
	const [value, setValue] = useState<string | undefined>(initialValue);
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<null | string>(null);
	const [availableOptions, setAvailableOptions] = useState(options);

	const selectedOption = options.find((opt) => opt.value === value);

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

				if (open === false) {
					setAvailableOptions(options);
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
								className={cn('h-48 object-cover', {
									'object-contain': isContain,
								})}
								src={
									selectedOption?.image
										? selectedOption.image
										: 'https://upload.wikimedia.org/wikipedia/en/e/e7/LOL_MSI_logo.svg'
								}
							/>

							{value ? (
								<div className="absolute bottom-0 left-0 w-full bg-black/40 p-2 text-center font-semibold text-base capitalize">
									{value}
								</div>
							) : null}
						</div>
					</CardHeader>
					<CardContent className="text-center">{title}</CardContent>
				</div>

				<CardFooter className="flex flex-col items-center gap-4">
					<div className="rounded-md border-2 border-yellow-500 px-3 py-2 text-base text-yellow-500">
						{points} PTS
					</div>
					<DialogTrigger asChild>
						<Button size="lg" variant={value ? 'outline' : 'default'}>
							{value ? translation.change : translation.make}
						</Button>
					</DialogTrigger>
				</CardFooter>
			</Card>
			<DialogContent className="w-11/12 max-w-6xl">
				<DialogHeader>
					<DialogTitle className="font-light text-2xl">{title}</DialogTitle>
				</DialogHeader>

				{options.length > 10 && (
					<ChooseAnswerSearch
						onInput={(e) =>
							setAvailableOptions(
								options.filter(({ value, title }) => {
									const a = (title ?? value)
										.toLowerCase()
										.includes(e.currentTarget.value.toLowerCase());
									const b = (title ?? value)
										.replaceAll("'", '')
										.toLowerCase()
										.includes(e.currentTarget.value.toLowerCase());
									return a || b;
								})
							)
						}
						onClear={() => setAvailableOptions(options)}
						translation={{ placeholder: translation.search }}
					/>
				)}

				<div
					className={cn('overflow-y-scroll', {
						'h-[55vh] sm:h-[65vh]': options.length > 10,
						'max-h-[55vh] sm:max-h-[65vh]': options.length <= 10,
					})}
				>
					<div
						className={cn('grid grid-cols-2 gap-8 px-3 py-4 sm:grid-cols-3', {
							'grid-cols-1': options.some(({ image }) => image),
						})}
					>
						{availableOptions.map((answer) => {
							const title = answer.title ?? answer.value;
							const icon = answer.icon ?? answer.image;
							const isSelected = value === answer.value;

							return (
								<Button
									key={answer.value}
									onClick={() => setValue(answer.value)}
									className={cn(
										'flex cursor-pointer justify-start gap-4 overflow-hidden rounded-md border border-border px-8 py-10 text-base capitalize',
										{
											'border-primary': isSelected,
										}
									)}
									variant="ghost"
								>
									{icon ? (
										<Image alt="" src={icon} width={85} height={85} />
									) : null}

									<div className="flex flex-col items-start justify-center">
										{answer.subtitle && (
											<p className="mb-1 font-light text-sm">
												{answer.subtitle}
											</p>
										)}
										<p className="text-lg">{title}</p>
									</div>
								</Button>
							);
						})}
					</div>
				</div>
				<DialogFooter className="flex items-center gap-8 px-8">
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
