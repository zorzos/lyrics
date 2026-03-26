import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTablet } from "@/context/TabletContext";
import { useColors } from "@/hooks/use-colors";
import { useDevice } from "@/hooks/use-device";
import { useSongs } from "@/hooks/useSongs";
import { Section, Song } from "@/types";
import { generateHref } from "@/utils/paramUtils";
import { Link } from "expo-router";
import { useMemo, useRef } from "react";
import {
	ActivityIndicator,
	SectionList,
	StyleSheet,
	TouchableOpacity,
} from "react-native";

export default function Songs() {
	const colors = useColors();
	const { isTablet } = useDevice();
	const { setSelected } = useTablet();

	const sectionListRef = useRef<SectionList<Song>>(null);
	const { data: rawSongs, isLoading, isError } = useSongs();

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
			<ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator size="large" />
			</ThemedView>
		);
	}

	if (isError || !memoizedSongs) {
		return (
			<ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ThemedText>Error loading songs</ThemedText>
			</ThemedView>
		);
	}

	const renderItem = ({ item }: { item: Song }) => {
		if (isTablet) {
			return (
				<TouchableOpacity
					style={{
						padding: 10,
						borderBottomWidth: 1,
						borderBottomColor: "lightgray",
					}}
					onPress={() => setSelected(item.id, "song", { title: item.title })}>
					<ThemedText style={{ color: colors.text, fontSize: 16 }}>
						{item.title}
					</ThemedText>
				</TouchableOpacity>
			);
		}

		return (
			<Link
				href={generateHref("viewSong", {
					id: item.id,
					title: item.title,
					lyrics: item.lyrics,
					tags: JSON.stringify(item.tags),
					duration: item.duration,
					shows: JSON.stringify(item.shows),
				})}
				asChild>
				<TouchableOpacity
					style={{
						padding: 10,
						borderBottomWidth: 1,
						borderBottomColor: "lightgray",
					}}>
					<ThemedText style={{ color: colors.text, fontSize: 16 }}>
						{item.title}
					</ThemedText>
				</TouchableOpacity>
			</Link>
		);
	};

	return (
		<ThemedView style={styles.container}>
			<SectionList
				ref={sectionListRef}
				sections={sections}
				keyExtractor={(item) => item.title}
				renderItem={renderItem}
				renderSectionHeader={({ section: { title } }) => (
					<ThemedView style={{ backgroundColor: colors.background, padding: 8 }}>
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