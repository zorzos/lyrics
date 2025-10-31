import { Dispatch, SetStateAction } from "react";

export interface TagType {
	id: string;
	name: string;
	color?: string | null;
};

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
	bpm: number;
};

export interface Show {
	id: string;
	title: string;
	date: Date;
	parts: number;
	draft: boolean;
};

export interface Section {
	title: string;
	data: Song[];
};

export interface SongInfoItem {
	label: string;
	value: string;
};

export interface ModalProps {
	modalInfo: any;
	setModalInfo: (visible: any) => void;
};

export interface MetronomeProps {
	value: number;
	containerStyle: object;
	contentStyle: object;
};

export type TagColorMap = Record<string, string>;

export interface NetworkContextType {
	isOnline: boolean;
};

export interface ShowSongsByParts {
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
};

export interface KeyProps {
	originalKey: string;
	spKey?: string;
	containerStyle: object;
};

export type KeyQuality = "major" | "minor";

export interface KeyInfo {
	name: string;       // normalized key name (C, C#, D, etc.)
	quality: KeyQuality; // major or minor
	semitone: number;    // semitone number 0-11
};

export interface MusicalKey {
	label: string;
	value: string;
	containerStyle: object;
	labelStyle: object;
};

export interface KeyPickerProps {
	open: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
	label: string;
	value: string;
	onChange: (val: string) => void;
	removeKey?: string;
	extraOptions?: {
		label: string;
		value: string;
		containerStyle?: object;
		labelStyle?: object;
	}[];
};

export interface Part {
	partNumber: number;
	songs: Song[];
};

interface AvailableSongModalContent {
	title: string;
	partNunber: number;
	[k: string]: any;
}

export interface AvailableSongsModalProps {
	content: AvailableSongModalContent;
	setContent: Dispatch<SetStateAction<boolean>>;
	onConfirm: (partNumber: number, selectedSongs: Song[]) => void;
};
