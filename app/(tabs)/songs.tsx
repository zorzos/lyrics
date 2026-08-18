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

const PLACEHOLDER_ID = "__new_song__";

export default function Songs() {
	const colors = useColors();
	const { isTablet } = useDevice();
	const {
		clearSelected,
		selectedId,
		isAdding,
		isEditing,
		setSelected,
		discardRef
	} = useTablet();

	const sectionListRef = useRef<SectionList<Song>>(null);
	const { data: rawSongs, isLoading, isError } = useSongs();

	useFocusEffect(
		useCallback(() => {
			clearSelected();
		}, [clearSelected]),
	);

	const memoizedSongs = useMemo(() => rawSongs ?? [], [rawSongs]);

	const sections: Section[] = useMemo(() => {
		const grouped: Record<string, Song[]> = {};

		memoizedSongs.forEach((song: Song) => {
			const firstLetter = song.title[0].toUpperCase();
			if (!grouped[firstLetter]) grouped[firstLetter] = [];
			grouped[firstLetter].push(song);
		});

		const sorted = Object.keys(grouped)
			.sort()
			.map((letter) => ({
				title: letter,
				data: grouped[letter].sort((a, b) => a.title.localeCompare(b.title)),
			}));

		// Prepend placeholder section when adding on tablet
		if (isTablet && isAdding) {
			return [
				{
					title: "",
					data: [
						{
							id: PLACEHOLDER_ID,
							title: "New Song",
							duration: 0,
							bpm: 0,
							lyrics: "",
							original_key: "",
							sp_key: "",
							year: 0,
							artist: [],
							tags: [],
							shows: [],
						} as Song,
					],
				},
				...sorted,
			];
		}

		return sorted;
	}, [memoizedSongs, isAdding, isTablet]);

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
		const isPlaceholder = item.id === PLACEHOLDER_ID;
		const isSelected = item.id === selectedId || (isPlaceholder && isAdding);

		const selectedStyle = isSelected && {
			// borderColor: colors.accent,
			borderWidth: 1,
			borderRadius: 24,
			borderBottomColor: colors.placeholderBorder,
			borderBottomWidth: 1,
			backgroundColor: colors.placeholderBackground,
		};

		const content = (
			<ThemedView style={{ gap: 2, backgroundColor: "transparent" }}>
				<ThemedText
					style={{
						color: isPlaceholder ? colors.placeholder : colors.text,
						fontSize: 16,
						fontStyle: isPlaceholder ? "italic" : "normal",
					}}>
					{item.title}
				</ThemedText>
				{isPlaceholder && (
					<ThemedText style={{ color: colors.placeholder, fontSize: 12 }}>
						Not saved yet
					</ThemedText>
				)}
			</ThemedView>
		);

		if (isTablet) {
			return (
				<TouchableOpacity
					style={[
						{ padding: 10 },
						selectedStyle,
						isPlaceholder && {
							marginTop: '2.5%'
						}
					]}
					onPress={() => {
						if (isPlaceholder) return;
						const doSelect = () => setSelected(item.id, "song", { title: item.title });
						if ((isEditing || isAdding) && discardRef.current) {
							discardRef.current(doSelect);
						} else {
							doSelect();
						}
					}}>
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
				<TouchableOpacity
					style={{
						padding: 10,
						borderBottomWidth: 1,
						borderBottomColor: "lightgray",
					}}>
					{content}
				</TouchableOpacity>
			</Link>
		);
	};

	return (
		<ThemedView style={styles.container}>
			<SectionList
				style={{ marginTop: '2.5%' }}
				ref={sectionListRef}
				sections={sections}
				keyExtractor={(item) => item.id}
				renderItem={renderItem}
				renderSectionHeader={({ section: { title } }) =>
					title ? (
						<ThemedView
							style={{ backgroundColor: colors.background, padding: 8 }}>
							<ThemedText style={{ color: colors.text, fontWeight: "bold" }}>
								{title}
							</ThemedText>
						</ThemedView>
					) : null
				}
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
