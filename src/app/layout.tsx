import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

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
			<body className="dark bg-background">
				<div>{children}</div>
			</body>
		</html>
	);
}
