import { getSongs, insertSong } from "@/lib/queries/songs";
import { Song } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useSongs() {
    return useQuery<Song[]>({
        queryKey: ["songs"],
        queryFn: async () => {
            const result = await getSongs();
            return result.parts.flatMap((parts) => parts.songs);
        },
    });
}

export function useInsertSong() {
    const queryClient = useQueryClient();
    return useMutation<Song>({
        mutationKey: ["newSong"],
        mutationFn: async (songData) => {
            const response = await insertSong(songData);
            return response.songId;
        },
        onSuccess() {
            queryClient.invalidateQueries({ queryKey: ["songs"] })
        },
    })
}