import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

const DATE_FORMAT = "DD/MM/YYYY";
const SONG_DURATION_FORMAT = "m:ss";
const SHOW_DURATION_FORMAT = "H:mm:ss";

export const formatDate = (date: Date): string => {
	return dayjs(date).format(DATE_FORMAT);
};

export const formatDuration = (seconds: number): string => {
	return dayjs.duration(seconds, "seconds").format(SONG_DURATION_FORMAT);
};

export const formatShowDuration = (seconds: number): string => {
	return dayjs.duration(seconds, "seconds").format(SHOW_DURATION_FORMAT);
};