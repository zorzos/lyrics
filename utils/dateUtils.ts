import { Song } from "@/types";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

const DATE_FORMAT = "DD/MM/YYYY";
const SONG_DURATION_FORMAT = "m:ss";
const SHOW_DURATION_FORMAT = "H:mm:ss";
const FORMAT_STRING_HOUR = "HH[h]mm[m]ss[s]";
const FORMAT_STRING = "mm[m]ss[s]";

export const formatDate = (date: Date): string => {
	return dayjs(date).format(DATE_FORMAT);
};

export const formatDuration = (seconds: number): string => {
	return dayjs.duration(seconds, "seconds").format(SONG_DURATION_FORMAT);
};

export const formatShowDuration = (seconds: number): string => {
	return dayjs.duration(seconds, "seconds").format(SHOW_DURATION_FORMAT);
};

export const parseDurationToSeconds = (text: string): number => {
	if (!text) return 0;
	const trimmed = text.trim();
	if (trimmed.includes(":")) {
		const [mm, ss] = trimmed.split(":").map(Number);
		if (!isNaN(mm) && !isNaN(ss)) return mm * 60 + ss;
		return 0;
	}
	const n = Number(trimmed);
	return Number.isNaN(n) ? 0 : n;
};

export const getTotalPartTime = (songs: Song[]): string => {
	const totalSeconds = songs.reduce((acc, song) => acc + song.duration, 0);
	const duration = dayjs.duration(totalSeconds, "seconds");
	const hasHours = duration.hours() > 0;
	return duration.format(hasHours ? FORMAT_STRING_HOUR : FORMAT_STRING);
};