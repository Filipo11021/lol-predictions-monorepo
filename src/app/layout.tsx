import type { Metadata } from "next";
import Link from "next/link";
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
				<div className="p-4">
					<Link
						href="/"
						style={{
							backgroundImage: "linear-gradient(to top left,#19e6c3,#9470fd)",
						}}
						className="scroll-m-20 text-center mx-auto bg-clip-text text-transparent block text-4xl mb-5 font-extrabold tracking-tight lg:text-5xl"
					>
						LEC PREDYKCJE
					</Link>
					{children}
				</div>
			</body>
		</html>
	);
}
