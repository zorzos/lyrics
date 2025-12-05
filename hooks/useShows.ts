import { getShows } from "@/lib/queries/shows";
import { useQuery } from "@tanstack/react-query";

export function useShows() {
    return useQuery({
        queryKey: ['shows'],
        queryFn: () => getShows()
    });
}