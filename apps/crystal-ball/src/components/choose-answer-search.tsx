import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { XIcon } from 'lucide-react';
import { type FormEvent, useRef } from 'react';

export function ChooseAnswerSearch({
	onInput,
	onClear,
	translation,
}: {
	onInput: (event: FormEvent<HTMLInputElement>) => void;
	onClear: () => void;
	translation: { placeholder: string };
}) {
	const inputRef = useRef<null | HTMLInputElement>(null);

	return (
		<div className="flex gap-2 mx-6 mt-4 mb-2">
			<Input
				onInput={(e) => {
					onInput(e);
				}}
				placeholder={translation.placeholder}
				type="search"
				ref={inputRef}
			/>
			<Button
				variant="ghost"
				className="p-1"
				onClick={() => {
					onClear();
					if (inputRef.current) {
						inputRef.current.value = '';
					}
				}}
			>
				<span className="sr-only">clear</span>
				<XIcon className="text-yellow-300" />
			</Button>
		</div>
	);
}
