import Link from 'next/link';

export function PredictionsTitle() {
	return (
		<Link
			href="/"
			style={{
				backgroundImage: 'linear-gradient(to top left,#19e6c3,#9470fd)',
			}}
			className="mx-auto mb-5 block scroll-m-20 bg-clip-text text-center font-extrabold text-4xl text-transparent tracking-tight lg:text-5xl"
		>
			LEC PREDYKCJE
		</Link>
	);
}
