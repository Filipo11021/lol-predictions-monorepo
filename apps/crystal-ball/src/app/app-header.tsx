import { ChangeLocale } from '@/components/change-locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getDiscordUserFromHeader } from '@/discord-auth/get-discord-user';
import { getServerTranslation } from '@/i18n/get-server-translation';
import { Button } from '@repo/ui/button';
import Link from 'next/link';

export function AppHeader() {
	const user = getDiscordUserFromHeader();
	if (!user.ok) return null;
	const t = getServerTranslation();

	return (
		<header className="sticky top-0 z-10 border-b bg-background">
			<div className="mx-auto flex max-w-[2000px] items-center justify-between gap-4 px-4 py-3 md:px-6">
				<div className="text-sm sm:text-base">
					<p className="mr-1 inline-block">Lewus MSI</p>
					<h1 className="inline-block">Crystal Ball</h1>
				</div>
				<div className="flex min-w-[80px] flex-col items-center text-xs sm:text-base">
					<div className="uppercase">{t.picksLockIn}</div>
					<div>11:00 07.05</div>
				</div>
				<div className="flex gap-8">
					<ChangeLocale />
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="outline"
								size="icon"
								className="overflow-hidden rounded-full"
							>
								<Avatar>
									<AvatarImage
										src={`https://cdn.discordapp.com/avatars/${user.data.id}/${user.data.avatar}.png`}
									/>
									<AvatarFallback>U</AvatarFallback>
								</Avatar>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>{user.data.username}</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem asChild>
								<Link href="/logout">{t.auth.logout}</Link>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	);
}
