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
	duration?: number | null;
	lyrics: string;
	tags?: TagType[];
	song_order?: number; // optional: order within a show
	shows?: Show[];
}

export type Show = {
	id: string;
	title: string;
	date: Date;
};

export type Section = {
	title: string;
	data: Song[];
};

export type SongInfoItem = {
	label: string;
	value: string;
}

export type ModalProps = {
	modalInfo: any;
	setModalInfo: (visible: any) => void;
};

export type MetronomeProps = {
	label: string;
	value: number;
	containerStyle: Object;
	contentStyle: Object;
};