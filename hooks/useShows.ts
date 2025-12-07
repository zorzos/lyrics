import { getShow, getShows, insertShow, updateShow } from "@/lib/queries/shows";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useShows() {
    return useQuery({
        queryKey: ["shows"],
        queryFn: () => getShows()
    });
}

export function useShow(showId: string) {
    return useQuery({
        queryKey: ["shows", showId],
        queryFn: () => getShow(showId),
        enabled: !!showId
    });
}

export function useUpsertShow() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }: { id?: string, payload: any }) => {
            if (id) {
                return updateShow(id, payload);
            } else {
                return insertShow(payload);
            }
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["shows"] });

            if (id) {
                queryClient.invalidateQueries({ queryKey: ["show", id] });
            }
        },
    })
}