import { fileURLToPath } from 'node:url';
import createJiti from 'jiti';
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin';

const jiti = createJiti(fileURLToPath(import.meta.url));

// Import env here to validate during build. Using jiti we can import .ts files :)
jiti('./src/env');

/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack: (config, { isServer }) => {
		if (isServer) {
			config.plugins = [...config.plugins, new PrismaPlugin()];
		}

		return config;
	},
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
