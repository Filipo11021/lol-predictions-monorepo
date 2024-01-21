import { resetDateToSameDay } from "../utils/reset-date-to-same-day";
import { EventT, scheduleResponseSchema } from "../schema/events.schema";
import { env } from "../env";

export async function fetchSchedule(): Promise<EventT[]> {
  try {
    const url =
    "https://esports-api.lolesports.com/persisted/gw/getSchedule?hl=en-GB&leagueId=98767991302996019";
  const res = await fetch(url, {
    headers: { "x-api-key": env.LOLESPORTS_API_KEY },
  });
  const data = scheduleResponseSchema.parse(await res.json());

  if (!data.data) throw Error("lolesports data error")

  return data.data?.schedule.events
  } catch (error) {
    console.log(error)

    throw Error("fetch error")
  }
}

export function filterCurrentEvents<E extends EventT>(
  events: E[],
  fieldName: keyof E
): EventT[] {
  const currentDate = resetDateToSameDay(new Date());
  let futureEvents: E[] = [];
  let closestDiff = Infinity;

  for (const event of events) {
    const date = resetDateToSameDay(
      event[fieldName] instanceof Date
        ? (event[fieldName] as Date)
        : new Date(event[fieldName] as string)
    );

    const isFuture = date.getTime() > currentDate.getTime();

    if (!isFuture) continue;

    const diff = Math.abs(date.getTime() - currentDate.getTime());
    if (diff < closestDiff) {
      closestDiff = diff;
      futureEvents = [event];
    } else if (diff === closestDiff) {
      futureEvents.push(event);
    }
  }

  return futureEvents;
}

export async function getCurrentEvents(): Promise<EventT[]> {
  const events = await fetchSchedule();

  const currentEvents = filterCurrentEvents(events, "startTime");

  return currentEvents;
}
