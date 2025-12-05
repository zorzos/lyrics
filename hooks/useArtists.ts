import getArtists from "@/lib/queries/artists";
import { useQuery } from "@tanstack/react-query";

export function useArtists() {
    return useQuery({
        queryKey: ["artists"],
        queryFn: () => getArtists()
    })
}