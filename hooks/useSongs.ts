import { getSong, getSongs, insertSong, updateSong } from "@/lib/queries/songs";
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

export function useUpsertSong() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, payload }: { id?: string, payload: any }) => {
			if (id) {
				return updateSong(id, payload);
			} else {
				return insertSong(payload);
			}
		},

		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: ["songs"] });

			if (id) {
				queryClient.invalidateQueries({ queryKey: ["song", id] });
			}
		},
	});
}
