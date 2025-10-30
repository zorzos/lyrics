import { supabase } from "@/lib/supabase";
import { ShowSongsByParts, Song } from "@/types";

export async function getSongs(showId?: string): Promise<ShowSongsByParts> {
	try {
		if (showId) {
			// Fetch songs linked to a specific show (with song_order and part/order info)
			const { data, error } = await supabase
				.from("show_songs")
				.select(
					`
					part,
					song_order,
					songs (
						*,
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
								date,
								draft,
								parts
							)
						)
					)
				`
				)
				.eq("show_id", showId)
				.order("part", { ascending: true })
				.order("song_order", { ascending: true });

			if (error) {
				console.error("Supabase error (showId branch):", error);
				throw error;
			}

			if (!data) return { parts: [] };

			// Group songs by part
			const grouped: { [key: number]: Song[] } = {};

			data.forEach((row: any) => {
				const partNumber = row.order ?? 1;
				const song = row.songs ?? {};
				const rawTags: any[] = song.song_tags ?? [];
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

				const formattedSong: Song = {
					id: song.id,
					title: song.title,
					artist: song.artist,
					duration: song.duration,
					lyrics: song.lyrics,
					tags,
					song_order: row.song_order ?? null,
					shows,
					original_key: song.original_key,
					sp_key: song.sp_key
				};

				if (!grouped[partNumber]) grouped[partNumber] = [];
				grouped[partNumber].push(formattedSong);
			});

			// Convert grouped object to sorted parts array
			const parts = Object.keys(grouped)
				.sort((a, b) => Number(a) - Number(b))
				.map((partNum) => ({
					partNumber: Number(partNum),
					songs: grouped[Number(partNum)],
				}));

			return { parts };
		} else {
			// Fetch all songs without a show
			const { data, error } = await supabase
				.from("songs")
				.select(
					`
          *,
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
              date,
              draft
            )
          )
        `
				)
				.order("title", { ascending: true });

			if (error) {
				console.error("Supabase error (all songs branch):", error);
				throw error;
			}

			if (!data) return { parts: [] };

			// Put all songs into a single part for consistency
			const songs: Song[] = data.map((song: any) => {
				const rawTags: any[] = song.song_tags ?? [];
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
					original_key: song.original_key,
					sp_key: song.sp_key
				} as Song;
			});

			return { parts: [{ partNumber: 1, songs }] };
		}
	} catch (err) {
		console.error("getSongs() failed:", err);
		throw err;
	}
}

export async function getSong(songId: string): Promise<Song> {
	try {
		const { data, error } = await supabase
			.from("songs")
			.select(
				`*, show_songs(shows (
								id,
								title,
								date,
								draft,
								parts
							)) ,song_tags(tags(id,name,color))`
			)
			.eq("id", songId)
			.single();

		const shows =
			(data.show_songs ?? [])
				.map((ss: any) => ss?.shows)
				.filter(Boolean)
				.sort((a: any, b: any) => {
					const da = a?.date ? new Date(a.date).getTime() : 0;
					const db = b?.date ? new Date(b.date).getTime() : 0;
					return db - da;
				}) ?? [];

		if (error) {
			console.error(error);
			throw error;
		}

		return {
			...data,
			tags: (data.song_tags ?? []).map((st: any) => st.tags),
			shows
		};
	} catch (err) {
		console.error("getSong() failed:", err);
		throw err;
	}
};