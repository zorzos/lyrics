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
