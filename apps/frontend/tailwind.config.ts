import uiTailwindConfig from '@repo/ui/tailwind.config';
import type { Config } from 'tailwindcss';

const config = {
	presets: [uiTailwindConfig],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
		'../../packages/ui/src/**/*.{ts,tsx}',
	],
} satisfies Config;

export default config;
