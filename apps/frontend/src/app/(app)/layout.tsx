import { ThemeProvider } from '@/components/theme-provider';
import '@repo/ui/theme.css';
import type { Metadata } from 'next';
import Script from 'next/script';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
	title: 'MSI predictions - lewus',
	description: 'MSI predictions - lewus',
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
					<div>{children}</div>
				</ThemeProvider>

				<Script
					async
					src="/stats/script.js"
					data-website-id="e3de5d2c-5740-4c7c-a7e9-65d9d939bc7c"
				/>
			</body>
		</html>
	);
}
