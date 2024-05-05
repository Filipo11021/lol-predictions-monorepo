import { ThemeProvider } from '@/components/ui/change-theme';
import { getServerLocale } from '@/i18n/get-server-translation';
import '@repo/ui/theme.css';
import type { Metadata } from 'next';
import Script from 'next/script';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
	title: 'Lewus MSI - Crystal Ball',
	description: 'Lewus MSI - Crystal Ball',
};

export default function RootLayout({
	children,
}: {
	children: ReactNode;
}) {
	const locale = getServerLocale();

	return (
		<html lang={locale}>
			<head>
				<link rel="icon" href="/favicon.ico" sizes="any" />
			</head>
			<body className="bg-background">
				<ThemeProvider attribute="class" defaultTheme="dark">
					{children}
				</ThemeProvider>

				<Script
					async
					src="/stats/script.js"
					data-website-id="c6b96461-30a9-4f2f-897b-179fdd64160a"
				/>
			</body>
		</html>
	);
}
