import { Song } from "@/types";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

const DATE_FORMAT = "DD/MM/YYYY";
const SONG_DURATION_FORMAT = "m:ss";
const SHOW_DURATION_FORMAT = "H:mm:ss";
const HOUR_FORMAT = "H";
const FORMAT_STRING = "ss";
const DOUBLE_MINUTE_FORMAT = "mm";
const SINGLE_MINUTE_FORMAT = "m";

export const formatDate = (date: Date): string => {
	return dayjs(date).format(DATE_FORMAT);
};

export const formatDuration = (seconds: number): string => {
	return dayjs.duration(seconds, "seconds").format(SONG_DURATION_FORMAT);
};

export const formatShowDuration = (seconds: number): string => {
	return dayjs.duration(seconds, "seconds").format(SHOW_DURATION_FORMAT);
};

export const getTotalPartTime = (songs: Song[]): string => {
	const totalSeconds = songs.reduce((acc, song) => acc + song.duration, 0);
	const duration = dayjs.duration(totalSeconds, "seconds");
	const hasHours = duration.hours() > 0;
	const doubleDigitMinutes = duration.minutes() > 9;
	const formatString =
		hasHours && HOUR_FORMAT + ":" +
			doubleDigitMinutes ? DOUBLE_MINUTE_FORMAT : SINGLE_MINUTE_FORMAT + ":" +
		FORMAT_STRING;
	return duration.format(formatString);
};