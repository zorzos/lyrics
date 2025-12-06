import { getSong, getSongs, insertSong } from "@/lib/queries/songs";
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
	return useMutation({
		mutationFn: async (songPayload: any) => {
			return insertSong(songPayload);
		},
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: ["songs"] });
		},
	});
}

export function useShowSongs(showId: any) {
	return useQuery({
		queryKey: ["song", showId],
		queryFn: async () => await getSongs(showId),
		enabled: !!showId,
	});
}

export function useSong(songId: string) {
	return useQuery({
		queryKey: ["song", songId],
		queryFn: () => getSong(songId),
		enabled: !!songId,
	});
}
