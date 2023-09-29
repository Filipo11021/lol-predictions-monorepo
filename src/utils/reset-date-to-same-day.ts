export function resetDateToSameDay(date: Date) {
  const copiedDate = new Date(date.getTime())
  copiedDate.setMilliseconds(0)
  copiedDate.setMinutes(0)
  copiedDate.setHours(5)
  return copiedDate
}