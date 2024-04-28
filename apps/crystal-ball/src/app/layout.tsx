import { ThemeProvider } from '@/components/ui/change-theme';
import type { Metadata } from 'next';
import Script from 'next/script';
import type { ReactNode } from 'react';
import '@repo/ui/theme.css';

export const metadata: Metadata = {
	title: 'Lewus MSI - Crystal Ball',
	description: 'Lewus MSI - Crystal Ball',
};

export default function RootLayout({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<html lang="en">
			<body className="bg-background">
				<ThemeProvider attribute="class" defaultTheme="dark">
					{children}
				</ThemeProvider>

				<Script
					async
					src="https://analytics.filipo.dev/script.js"
					data-website-id="c6b96461-30a9-4f2f-897b-179fdd64160a"
				/>
			</body>
		</html>
	);
}
