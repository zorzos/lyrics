export interface TagType {
	id: string;
	name: string;
	color?: string | null;
}

/**
 * Unified Song type
 * song_order is optional and only set when the song belongs to a show
 */
export interface Song {
	id: string;
	title: string;
	artist: string;
	duration: number;
	lyrics: string;
	tags?: TagType[];
	song_order?: number; // optional: order within a show
	shows?: Show[];
	original_key: string;
	sp_key?: string;
}

export type Show = {
	id: string;
	title: string;
	date: Date;
	parts: number;
	draft: boolean;
};

export type Section = {
	title: string;
	data: Song[];
};

export type SongInfoItem = {
	label: string;
	value: string;
};

export type ModalProps = {
	modalInfo: any;
	setModalInfo: (visible: any) => void;
};

export type MetronomeProps = {
	value: number;
	containerStyle: object;
	contentStyle: object;
};

export type TagColorMap = Record<string, string>;

export type NetworkContextType = {
	isOnline: boolean;
};

export type ShowSongsByParts = {
	parts: {
		partNumber: number;
		songs: Song[];
	}[];
};

export enum ShowInfoTypes {
	DATE = "date",
	LOCATION = "location",
	TIME = "time",
	TYPE = "type",
}

export type KeyProps = {
	originalKey: string;
	spKey?: string;
	containerStyle: object;
};

export type KeyQuality = "major" | "minor";

export interface KeyInfo {
	name: string;       // normalized key name (C, C#, D, etc.)
	quality: KeyQuality; // major or minor
	semitone: number;    // semitone number 0-11
}

export type MusicalKey = {
	label: string;
	value: string;
	containerStyle: object;
	labelStyle: object;
};