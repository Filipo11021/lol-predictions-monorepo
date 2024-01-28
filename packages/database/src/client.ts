import { PrismaClient } from '../prisma-client';
export * from '../prisma-client';

const prismaClientSingleton = () => {
	return new PrismaClient();
};

declare global {
	// biome-ignore lint/style/noVar: var is required for global declaration
	var _prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis._prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis._prisma = prisma;
