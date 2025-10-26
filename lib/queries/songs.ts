import { supabase } from "@/lib/supabase";
import { Song } from "@/types";

type RawSongTagRow = { tags?: { id: string; name: string; color?: string }[] } | null;
type RawShowSongRow = { song_order?: number; songs?: any } | null;

export async function getSongs(showId?: string): Promise<Song[]> {
	try {
		if (showId) {
			// Fetch songs linked to a specific show (with the song_order)
			const { data, error } = await supabase
				.from("show_songs")
				.select(
					`
          song_order,
          songs (
            id,
            title,
            artist,
            duration,
            lyrics,
            song_tags (
              tags (
                id,
                name,
                color
              )
            ),
            show_songs (
              shows (
                id,
                title,
                date
              )
            )
          )
        `
				)
				.eq("show_id", showId)
				.order("song_order", { ascending: true });

			if (error) {
				console.error("Supabase error (showId branch):", error);
				throw error;
			}

			if (!data) return [];

			return data.map((row: RawShowSongRow) => {
				const song = row?.songs ?? {};
				const rawTags: RawSongTagRow[] = song.song_tags ?? [];
				const tags = rawTags.flatMap((t) => (t?.tags ? t.tags : []));

				// collect shows where this song appears
				const shows =
					(song.show_songs ?? [])
						.map((ss: any) => ss?.shows)
						.filter(Boolean)
						.sort((a: any, b: any) => {
							// handle null or invalid dates defensively
							const da = a?.date ? new Date(a.date).getTime() : 0;
							const db = b?.date ? new Date(b.date).getTime() : 0;
							return db - da;
						}) ?? [];

				return {
					id: song.id,
					title: song.title,
					artist: song.artist,
					duration: song.duration,
					lyrics: song.lyrics,
					tags,
					song_order: row?.song_order ?? null,
					shows,
				} as Song;
			});
		} else {
			// Fetch all songs
			const { data, error } = await supabase
				.from("songs")
				.select(
					`
          id,
          title,
          artist,
          duration,
          lyrics,
          song_tags (
            tags (
              id,
              name,
              color
            )
          ),
          show_songs (
            shows (
              id,
              title,
              date
            )
          )
        `
				)
				.order("title", { ascending: true });

			if (error) {
				console.error("Supabase error (all songs branch):", error);
				throw error;
			}

			if (!data) return [];

			return data.map((song: any) => {
				const rawTags: RawSongTagRow[] = song.song_tags ?? [];
				const tags = rawTags.flatMap((t) => (t?.tags ? t.tags : []));

				const shows =
					(song.show_songs ?? [])
						.map((ss: any) => ss?.shows)
						.filter(Boolean)
						.sort((a: any, b: any) => {
							const da = a?.date ? new Date(a.date).getTime() : 0;
							const db = b?.date ? new Date(b.date).getTime() : 0;
							return db - da;
						}) ?? [];

				return {
					id: song.id,
					title: song.title,
					artist: song.artist,
					duration: song.duration,
					lyrics: song.lyrics,
					tags,
					shows,
				} as Song;
			});
		}
	} catch (err) {
		// make sure the caller sees something useful
		console.error("getSongs() failed:", err);
		throw err;
	}
}
