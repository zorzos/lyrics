import { supabase } from "@/lib/supabase";
import { Song } from "@/types";

/**
 * Fetch all songs, or fetch songs for a specific show with order
 * Returns Song[] in all cases
 */
export async function getSongs(showId?: string): Promise<Song[]> {
	if (showId) {
		// Fetch songs linked to a specific show
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
          )
        )
      `
			)
			.eq("show_id", showId)
			.order("song_order", { ascending: true });

		if (error) throw error;

		return (
			data?.map((item: any) => ({
				...item.songs,
				tags: item.songs.song_tags.map((st: any) => st.tags),
				song_order: item.song_order,
			})) ?? []
		);
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
        )
      `
			)
			.order("title", { ascending: true });

		if (error) throw error;

		return (
			data?.map((song: any) => ({
				...song,
				tags: song.song_tags.map((st: any) => st.tags),
			})) ?? []
		);
	}
}
