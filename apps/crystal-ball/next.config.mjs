import { fileURLToPath } from 'node:url';
import createJiti from 'jiti';
const jiti = createJiti(fileURLToPath(import.meta.url));

// Import env here to validate during build. Using jiti we can import .ts files :)
jiti('./src/env');

/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{ hostname: 'ddragon.leagueoflegends.com' },
			{ hostname: 'static.lolesports.com' },
			{
				hostname: 'lolstatic-a.akamaihd.net',
			},
			{
				hostname: 's3.us-west-2.amazonaws.com',
			},
		],
	},
};

export default nextConfig;
