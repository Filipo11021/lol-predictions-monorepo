import Link from "next/link";

export function TableTitle() {
	return (
		<Link
			href="/"
			style={{
				backgroundImage: "linear-gradient(to top left,#19e6c3,#9470fd)",
			}}
			className="scroll-m-20 text-center mx-auto bg-clip-text text-transparent block text-4xl mb-5 font-extrabold tracking-tight lg:text-5xl"
		>
			LEC PREDYKCJE
		</Link>
	);
}
