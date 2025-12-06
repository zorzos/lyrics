import { supabase } from "../supabase";

export async function getSongArtistIds(songId: string): Promise<string[]> {
    const { data, error } = await supabase
        .from("song_artists")
        .select("artist_id")
        .eq("song_id", songId);

    if (error) throw error;
    return data.map(r => r.artist_id.toString());
}

export async function getSongTagIds(songId: string): Promise<string[]> {
    const { data, error } = await supabase
        .from("song_tags")
        .select("tag_id")
        .eq("song_id", songId);

    if (error) throw error;
    return data.map(r => r.tag_id.toString());
}
