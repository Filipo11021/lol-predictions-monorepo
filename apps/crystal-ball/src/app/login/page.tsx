import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getServerTranslation } from '@/i18n/get-server-translation';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage({
	searchParams: { error },
}: { searchParams: { error: string | undefined } }) {
	const t = getServerTranslation();
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="flex flex-col items-center p-4">
				<h1
					style={{
						backgroundImage: 'linear-gradient(to top left,#19e6c3,#9470fd)',
					}}
					className="mb-16 block bg-clip-text font-extrabold text-5xl text-transparent tracking-tight lg:text-7xl"
				>
					Crystal Ball
				</h1>
				<p className="mb-8 max-w-[600px] text-center text-lg leading-6">
					Crystall ball to konkurs predykcji nietypowych zdarzeń na{' '}
					<span className="font-semibold">FAZĘ GŁÓWNĄ MSI</span> (PLAYINY
					POMIJAMY). Pokaż domanicję swoimi typami i wygraj koszulkę esportową.
					Ligę Typera i więcej informacji znajdziesz na discordzie na kanale{' '}
					<a
						className="border-blue-400 border-b"
						href="https://discord.gg/HvWEJZ3GcE"
					>
						#predykcje-info-msi2024
					</a>
				</p>
				<Button
					size="lg"
					variant="ghost"
					className="bg-[#7289da] text-white hover:bg-[#7289da]/60"
					asChild
				>
					<Link href="/login/discord">{t.auth.discord.login}</Link>
				</Button>
				{error ? (
					<Alert variant="destructive" className="mt-4">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>{t.auth.discord.error.title}</AlertTitle>
						<AlertDescription>
							{t.auth.discord.error.description}
						</AlertDescription>
					</Alert>
				) : null}
			</div>
		</div>
	);
}
