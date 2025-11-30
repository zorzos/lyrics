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

export default async function getArtists() {
	try {
		const { data, error } = await supabase.from("artists").select("*");
		if (error) console.error(error);

		return data;
	} catch (error) {
		console.error("getArtists() failed:", error);
		throw error;
	}
};
