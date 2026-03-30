import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTablet } from "@/context/TabletContext";
import { useColors } from "@/hooks/use-colors";
import { useDevice } from "@/hooks/use-device";
import { useSongs } from "@/hooks/useSongs";
import { Section, Song } from "@/types";
import { generateHref } from "@/utils/paramUtils";
import { Link, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef } from "react";
import {
	ActivityIndicator,
	SectionList,
	StyleSheet,
	TouchableOpacity,
} from "react-native";

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: "2.5%",
	},
});

export default function Songs() {
	const { selectedId } = useTablet();
	const colors = useColors();
	const { isTablet } = useDevice();
	const { setSelected, clearSelected } = useTablet();

	const sectionListRef = useRef<SectionList<Song>>(null);
	const { data: rawSongs, isLoading, isError } = useSongs();

	useFocusEffect(useCallback(() => clearSelected, [clearSelected]));

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

	const renderItem = ({ item }: { item: Song }) => {
		const isSelected = item.id === selectedId;
		const content = (
			<ThemedText style={{ color: colors.text, fontSize: 16 }}>
				{item.title}
			</ThemedText>
		);

		const selectedStyle = isSelected && {
			borderColor: colors.accent,
			borderWidth: 1,
			borderRadius: 20,
			borderBottomColor: colors.accent,
			borderBottomWidth: 1,
			backgroundColor: `${colors.accent}15`,
		};

		if (isTablet) {
			return (
				<TouchableOpacity
					style={[{ padding: 12 }, selectedStyle]}
					onPress={() => setSelected(item.id, "song", { title: item.title })}>
					{content}
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
				<TouchableOpacity style={{ padding: 10 }}>{content}</TouchableOpacity>
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
					<ThemedView
						style={{
							backgroundColor: colors.background,
							padding: 8,
							borderBottomWidth: 1,
							borderBottomColor: `${colors.text}35`,
							marginBottom: 4,
						}}>
						<ThemedText
							style={{ fontSize: 18, color: colors.text, fontWeight: "bold" }}>
							{title}
						</ThemedText>
					</ThemedView>
				)}
				stickySectionHeadersEnabled
			/>
		</ThemedView>
	);
}
