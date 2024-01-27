export function isToday(date: Date) {
	const today = new Date()

	if (today.toDateString() === date.toDateString()) {
		return true
	}

	return false
}
