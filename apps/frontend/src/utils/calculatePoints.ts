import type { $Enums } from '@repo/database';

export function calculatePoints({
	voter,
	winner,
	type,
}: {
	type: $Enums.MatchType | null;
	voter: { code: string | null; score: string | null };
	winner: { code: string | null; score: string | null };
}) {
	if (!(winner.code && winner.code)) return 0;
	const won = winner.code === voter.code;
	if (!won) return 0;

	switch (type) {
		case 'BO1':
			return 1;
		case 'BO3':
			return voter.score === winner.score ? 2 : 1;
		case 'BO5':
			return voter.score === winner.score ? 5 : 2;
		default:
			throw Error('not implemented');
	}
}
