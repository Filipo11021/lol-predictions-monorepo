import '@repo/ui/theme.css';
import type { Metadata } from 'next';
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
			<body>
				{children}
			</body>
		</html>
	);
}
