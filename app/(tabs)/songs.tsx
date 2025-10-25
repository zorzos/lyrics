import {
	ActivityIndicator,
	SectionList,
	StyleSheet,
	TouchableOpacity,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getSongs } from "@/lib/queries/songs";
import { Section, Song } from "@/types";
import { useTheme } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { useMemo, useRef } from "react";

export default function Songs() {
	const { colors } = useTheme();
	const sectionListRef = useRef<SectionList<Song>>(null);
	const {
		data: rawSongs,
		isLoading,
		isError,
	} = useQuery<Song[]>({
		queryKey: ["allSongs"],
		queryFn: () => getSongs(),
	});

	const memoizedSongs = useMemo(() => rawSongs ?? [], [rawSongs]);
	const sections: Section[] = useMemo(() => {
		const grouped: Record<string, Song[]> = {};

		memoizedSongs.forEach((song: Song) => {
			const firstLetter = song.title[0].toUpperCase();
			if (!grouped[firstLetter]) grouped[firstLetter] = [];
			grouped[firstLetter].push(song);
		});

		return Object.keys(grouped)
			.sort()
			.map((letter) => ({
				title: letter,
				data: grouped[letter].sort((a, b) => a.title.localeCompare(b.title)),
			}));
	}, [memoizedSongs]);

	if (isLoading) {
		return (
			<ThemedView
				style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator size="large" />
			</ThemedView>
		);
	}

	if (isError || !memoizedSongs) {
		return (
			<ThemedView
				style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ThemedText>Error loading songs</ThemedText>
			</ThemedView>
		);
	}

	return (
		<ThemedView style={styles.container}>
			<SectionList
				ref={sectionListRef}
				sections={sections}
				keyExtractor={(item) => item.title}
				renderItem={({ item }) => (
					<Link
						href={{
							pathname: "/song/[id]",
							params: {
								id: item.id,
								title: item.title,
								lyrics: item.lyrics,
								tags: JSON.stringify(item.tags),
								duration: item.duration,
							},
						}}
						asChild>
						<TouchableOpacity style={{ padding: 10 }}>
							<ThemedText style={{ color: colors.text, fontSize: 16 }}>
								{item.title}
							</ThemedText>
						</TouchableOpacity>
					</Link>
				)}
				renderSectionHeader={({ section: { title } }) => (
					<ThemedView style={{ backgroundColor: colors.card, padding: 8 }}>
						<ThemedText style={{ color: colors.text, fontWeight: "bold" }}>
							{title}
						</ThemedText>
					</ThemedView>
				)}
				stickySectionHeadersEnabled
			/>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: "2.5%",
	},
});
