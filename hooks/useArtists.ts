import getArtists, { insertArtists } from "@/lib/queries/artists";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useArtists() {
    return useQuery({
        queryKey: ["artists"],
        queryFn: () => getArtists()
    })
}

export function useInsertArtists() {
    return useMutation({
        mutationFn: async (artists: any) => {
            if (!artists.length) return [];
            return insertArtists(artists);
        },
    });
}
