import getTags from "@/lib/queries/tags";
import { supabase } from "@/lib/supabase";
import { TagColorMap } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const TAG_COLORS_QUERY_KEY = ["tagColors"];

export const useTagColors = () => {
    const queryClient = useQueryClient();

    const { data: tagColorMap = {} } = useQuery<TagColorMap>({
        queryKey: TAG_COLORS_QUERY_KEY,
        queryFn: async () => {
            const result = await getTags();
            if (!result) return {};
            const map: TagColorMap = {};
            result.forEach((tag) => {
                if (tag?.name) map[tag.name.toLowerCase()] = tag.color ?? "#FFFFFF";
            });
            return map;
        },
        initialData: {},
    });

    useEffect(() => {
        const channel = supabase
            .channel("tags-changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "tags" },
                (payload) => {
                    queryClient.setQueryData<TagColorMap>(TAG_COLORS_QUERY_KEY, (prev = {}) => {
                        const updated = { ...prev };

                        if (payload.eventType === "DELETE" && payload.old?.name) {
                            delete updated[payload.old.name.toLowerCase()];
                        } else if (
                            (payload.eventType === "INSERT" || payload.eventType === "UPDATE") &&
                            payload.new?.name
                        ) {
                            updated[payload.new.name.toLowerCase()] = payload.new.color ?? "#FFFFFF";
                        }

                        return updated;
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    return tagColorMap;
};

export function useTags() {
    return useQuery({
        queryKey: ["tags"],
        queryFn: () => getTags()
    })
}