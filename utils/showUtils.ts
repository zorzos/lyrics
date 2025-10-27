import { Show } from "@/types";
import dayjs from "dayjs";

export type ShowSection = {
	title: string;
	data: Show[];
};

/**
 * Categorizes shows into Drafts / Upcoming / Past
 */
export function categoriseShows(shows: Show[]): ShowSection[] {
	const today = dayjs();

	const drafts = shows.filter((s) => s.draft);
	const upcoming = shows.filter(
		(s) =>
			!s.draft &&
			(dayjs(s.date).isAfter(today, "day") ||
				dayjs(s.date).isSame(today, "day"))
	);
	const past = shows.filter(
		(s) => !s.draft && dayjs(s.date).isBefore(today, "day")
	);

	const sections: ShowSection[] = [
		{ title: "Upcoming", data: upcoming },
		{ title: "Drafts", data: drafts },
		{ title: "Past Shows", data: past },
	].filter((sec) => sec.data.length > 0);

	return sections;
}
