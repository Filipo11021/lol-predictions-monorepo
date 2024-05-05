const { PrismaPlugin } = require('@prisma/nextjs-monorepo-workaround-plugin');
/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack: (config, { isServer }) => {
		if (isServer) {
			config.plugins = [...config.plugins, new PrismaPlugin()];
		}

		return config;
	},
	rewrites() {
		return [
			{
				source: '/stats/:match*',
				destination: 'https://analytics.filipo.dev/:match*',
			},
		];
	},
};

module.exports = nextConfig;
