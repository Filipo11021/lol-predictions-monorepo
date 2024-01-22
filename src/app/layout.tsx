import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
	title: "LEC predictions - lewus",
	description: "LEC predictions - lewus",
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
			</body>
		</html>
	);
}
