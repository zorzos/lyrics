import { supabase } from "@/lib/supabase";
import { ShowSongsByParts, Song } from "@/types";

export async function getSongs(showId?: string): Promise<ShowSongsByParts> {
	try {
		if (showId) {
			const { data, error } = await supabase
				.from("show_songs")
				.select(
					`
            part,
            song_order,
            songs (
              *,
              artists:artists!song_artists(*),
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

			if (error) throw error;
			if (!data) return { parts: [] };

			const grouped: { [key: number]: Song[] } = {};

			data.forEach((row: any) => {
				const partNumber = row.part ?? 1;
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

				const artist = song.artists ?? [];

				const formattedSong: Song = {
					id: song.id,
					title: song.title,
					artist,
					duration: song.duration,
					lyrics: song.lyrics,
					tags,
					song_order: row.song_order ?? null,
					shows,
					original_key: song.original_key,
					sp_key: song.sp_key,
					bpm: song.bpm,
				};

				if (!grouped[partNumber]) grouped[partNumber] = [];
				grouped[partNumber].push(formattedSong);
			});

			const parts = Object.keys(grouped)
				.sort((a, b) => Number(a) - Number(b))
				.map((partNum) => ({
					partNumber: Number(partNum),
					songs: grouped[Number(partNum)],
				}));

			return { parts };
		} else {
			const { data, error } = await supabase
				.from("songs")
				.select(
					`
            *,
            artists:artists!song_artists(*),
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

			if (error) throw error;
			if (!data) return { parts: [] };

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

				const artist = song.artists ?? [];

				return {
					id: song.id,
					title: song.title,
					artist,
					duration: song.duration,
					lyrics: song.lyrics,
					tags,
					shows,
					original_key: song.original_key,
					sp_key: song.sp_key,
					bpm: song.bpm,
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
				`
          *,
          artists:artists!song_artists(*),
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
        `
			)
			.eq("id", songId)
			.single();

		if (error) {
			console.error("Supabase error in getSong:", error);
			throw error;
		}

		if (!data) throw new Error("Song not found");

		// Extract tags
		const rawTags: any[] = data.song_tags ?? [];
		const tags = rawTags.flatMap((t) => (t?.tags ? t.tags : []));

		// Extract shows
		const shows =
			(data.show_songs ?? [])
				.map((ss: any) => ss?.shows)
				.filter(Boolean)
				.sort((a: any, b: any) => {
					const da = a?.date ? new Date(a.date).getTime() : 0;
					const db = b?.date ? new Date(b.date).getTime() : 0;
					return db - da;
				}) ?? [];

		// Extract artists (many-to-many)
		const artist = data.artists ?? [];

		return {
			id: data.id,
			title: data.title,
			artist,
			duration: data.duration,
			lyrics: data.lyrics,
			tags,
			shows,
			original_key: data.original_key,
			sp_key: data.sp_key,
			bpm: data.bpm,
		} as Song;
	} catch (err) {
		console.error("getSong() failed:", err);
		throw err;
	}
}

export async function insertSong(newSong: any) {
	try {
		const { artists, tags, ...songFields } = newSong;
		const { data: song, error } = await supabase
			.from("songs")
			.insert(songFields)
			.select("id")
			.single();

		if (error) {
			throw new Error(`Failed to create song: ${error.message}`);
		}

		const songId = song.id;
		const rows = artists.map((artistId: string) => ({
			song_id: songId,
			artist_id: artistId,
		}));
		const { error: relationError } = await supabase
			.from("song_artists")
			.insert(rows);

		if (relationError) {
			throw new Error(`Failed to link artists: ${relationError.message}`);
		}

		if (tags.length > 0) {
			const rows = newSong.tags.map((tagId: string) => ({
				song_id: songId,
				tag_id: tagId,
			}));

			const { error } = await supabase.from("song_tags").insert(rows);
			if (error) throw error;
		}

		return { songId };
	} catch (err) {
		console.error("insertSong() failed:", err);
		throw err;
	}
}