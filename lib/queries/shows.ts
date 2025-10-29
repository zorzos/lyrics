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
