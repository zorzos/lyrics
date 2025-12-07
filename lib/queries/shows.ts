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

export async function getShow(showId: string): Promise<Show> {
	const { data, error } = await supabase
		.from("shows")
		.select(
			`
						id, title, date, draft, parts,
						show_songs(order, songs(id, title, artist, duration))
					`
		)
		.eq("id", showId)
		.single();

	if (error) throw error;
	return data ?? null;
}

export async function insertShow(payload: any) {

}

export async function updateShow(showId: string, payload: any) {

}