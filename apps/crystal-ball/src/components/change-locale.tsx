'use client';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { changeLocale, isLocale } from '@/i18n/i18n';
import { useRouter } from 'next/navigation';

export function ChangeLocale() {
	const { refresh } = useRouter();
	return (
		<Select
			onValueChange={(value) => {
				if (isLocale(value)) {
					changeLocale(value);
					refresh();
				}
			}}
			defaultValue={
				document.cookie
					.split(';')
					.find((val) => val.startsWith('locale='))
					?.split('=')[1] ?? 'pl'
			}
		>
			<SelectTrigger className="w-[180px]">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectItem value="pl">Polski</SelectItem>
					<SelectItem value="en">English</SelectItem>
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}
