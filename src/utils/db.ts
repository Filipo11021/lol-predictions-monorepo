import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
	return new PrismaClient();
};

declare global {
	// biome-ignore lint/style/noVar: <explanation>
	var db: undefined | ReturnType<typeof prismaClientSingleton>;
}

// biome-ignore lint/suspicious/noRedeclare: <explanation>
export const db = globalThis.db ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.db = db;
