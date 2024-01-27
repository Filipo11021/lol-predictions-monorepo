import { PrismaClient } from '@prisma/client';
export * from '@prisma/client';

const prismaClientSingleton = () => {
	return new PrismaClient();
};

declare global {
	// biome-ignore lint/style/noVar: var is required for global declaration
	var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

// biome-ignore lint/suspicious/noRedeclare: <explanation>
export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
