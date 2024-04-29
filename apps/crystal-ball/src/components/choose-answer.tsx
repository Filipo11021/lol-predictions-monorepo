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
import { ChooseAnswerSearch } from './choose-answer-search';

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
								className={cn('object-cover h-48', {
									'object-contain': isContain,
								})}
								src={
									selectedOption?.image
										? selectedOption.image
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
					className={cn(' overflow-y-scroll', {
						'h-[55dvh] sm:h-[65dvh]': options.length > 10,
						'max-h-[55dvh] sm:max-h-[65dvh]': options.length <= 10,
					})}
				>
					<div
						className={cn('grid grid-cols-2 sm:grid-cols-3 gap-8 py-4 px-3', {
							'grid-cols-1': options.some(({ image }) => image),
						})}
					>
						{availableOptions.map((answer) => {
							const title = answer.title ?? answer.value;
							const icon = answer.icon ?? answer.image;
							const isSelected = value === answer.value;

							return (
								<Button
									onClick={() => setValue(answer.value)}
									className={cn(
										'cursor-pointer border overflow-hidden flex justify-start gap-4 capitalize border-border px-8 py-10  rounded-md text-base',
										{
											'border-primary': isSelected,
										}
									)}
									variant="ghost"
								>
									{icon ? (
										<Image alt="" src={icon} width={85} height={85} />
									) : null}

									<div className="flex flex-col justify-center items-start">
										{answer.subtitle && (
											<p className="text-sm font-light mb-1">
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
				<DialogFooter className="flex gap-8 items-center px-8">
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
