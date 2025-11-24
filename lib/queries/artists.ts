import { supabase } from "@/lib/supabase";
import { Artist, NewArtist } from "@/types";

const handleError = (error: any) => {
	console.error("insertNewArtists failed:", error);
	throw error;
};

export async function insertArtists(newArtists: NewArtist[]): Promise<any> {
	if (newArtists.length === 0) return [];
	try {
		const { data, error } = await supabase
			.from("artists")
			.insert(newArtists)
			.select("id, name");

		if (error) handleError(error);

		return data as Artist[];
	} catch (err) {
		handleError(err);
	}
}
