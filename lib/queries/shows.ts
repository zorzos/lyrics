import { supabase } from "@/lib/supabase";
import { Show } from "@/types";

export async function getShows(): Promise<Show[]> {
	const { data, error } = await supabase
		.from("shows")
		.select("id, title, date, draft, parts")
		.order("date", { ascending: false });

	if (error) throw error;
	return data ?? [];
}

export async function getShow(showId: string) {
	const { data, error } = await supabase
		.from("shows")
		.select(`
      id,
      title,
      date,
      draft,
      parts,
      show_songs (
        id,
        song_order,
        part,
        songs (
          id,
          title,
          duration,
          bpm,
          lyrics,
          original_key,
          song_artists (
            artists (
              id,
              name
            )
          )
        )
      )
    `)
		.eq("id", showId)
		.order("song_order", { foreignTable: "show_songs", ascending: true })
		.single();

	if (error) throw error;
	return data;
}


export async function insertShow(payload: any) {

}

export async function updateShow(showId: string, payload: any) {

}