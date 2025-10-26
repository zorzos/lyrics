// /context/TagContext.tsx
import { supabase } from "@/lib/supabase";
import { TagColorMap } from "@/types";
import React, { createContext, useContext, useEffect, useState } from "react";

const TagContext = createContext<TagColorMap | null>(null);

export const TagProvider = ({ children }: { children: React.ReactNode }) => {
	const [tagColorMap, setTagColorMap] = useState<TagColorMap>({});

	// --- Fetch all tags once on mount ---
	useEffect(() => {
		const fetchTags = async () => {
			const { data, error } = await supabase.from("tags").select("name, color");

			if (error) {
				console.error("❌ Error fetching tags:", error);
				return;
			}

			if (data) {
				const map: TagColorMap = {};
				data.forEach((tag) => {
					if (tag.name) map[tag.name.toLowerCase()] = tag.color ?? "#FFFFFF";
				});
				setTagColorMap(map);
			}
		};

		fetchTags();

		// --- Subscribe to real-time changes ---
		const channel = supabase
			.channel("tags-changes")
			.on(
				"postgres_changes",
				{
					event: "*", // listen for INSERT, UPDATE, DELETE
					schema: "public",
					table: "tags",
				},
				(payload) => {
					console.log("🔄 Tags change detected:", payload);

					setTagColorMap((prev) => {
						const updated = { ...prev };

						if (payload.eventType === "DELETE" && payload.old.name) {
							delete updated[payload.old.name.toLowerCase()];
						} else if (
							(payload.eventType === "INSERT" ||
								payload.eventType === "UPDATE") &&
							payload.new.name
						) {
							updated[payload.new.name.toLowerCase()] =
								payload.new.color ?? "#FFFFFF";
						}

						return updated;
					});
				}
			)
			.subscribe();

		// --- Cleanup ---
		return () => {
			supabase.removeChannel(channel);
		};
	}, []);

	return (
		<TagContext.Provider value={tagColorMap}>{children}</TagContext.Provider>
	);
};

export const useTagColors = (): TagColorMap => {
	const context = useContext(TagContext);
	if (!context) {
		throw new Error("useTagColors must be used within a TagProvider");
	}
	return context;
};
