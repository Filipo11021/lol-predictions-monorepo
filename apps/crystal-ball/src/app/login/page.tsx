import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { getServerTranslation } from '@/i18n/get-server-translation';

export default function LoginPage({
	searchParams: { error },
}: { searchParams: { error: string | undefined } }) {
	const t = getServerTranslation();
	return (
		<div className="flex justify-center items-center min-h-screen">
			<div className="flex flex-col items-center">
				<h1
					style={{
						backgroundImage: 'linear-gradient(to top left,#19e6c3,#9470fd)',
					}}
					className="bg-clip-text text-transparent block text-5xl mb-16 font-extrabold tracking-tight lg:text-7xl"
				>
					Crystal Ball
				</h1>
				<Button
					size="lg"
					variant="ghost"
					className="text-white bg-[#7289da] hover:bg-[#7289da]/60"
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
