import { db } from "@/utils/db";

export function getAllGameDays() {
	return db.gameDay.findMany({ orderBy: { firstMatchStart: "desc" } });
}
