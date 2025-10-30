import { supabase } from "@/lib/supabase";

export default async function getTags() {
    try {
        const { data, error } = await supabase.from("tags").select("*");
        if (error) console.error(error);

        return data;
    } catch (error) {
        console.error("getTags() failed:", error);
        throw error;
    }
};
