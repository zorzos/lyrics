import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import InfoModal from "@/components/ui/InfoModal";
import LyricsRenderer from "@/components/ui/LyricsRenderer";
import Metronome from "@/components/ui/Metronome";
import Tag from "@/components/ui/Tag";
import { Show, Song, TagType } from "@/types";
import { formatDuration } from "@/utils/dateUtils";
import { generateHref, getSingleParam } from "@/utils/paramUtils";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Link, useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";

import InfoBlock from "@/components/ui/InfoBlock";
import Key from "@/components/ui/Key";
import { useTablet } from "@/context/TabletContext";
import { useColors } from "@/hooks/use-colors";
import { useDevice } from "@/hooks/use-device";
import { getSong } from "@/lib/queries/songs";
import { width } from "@/utils/utils";

export default function SongDetailScreen() {
	const colors = useColors();
	const { isTablet } = useDevice();
	const { id: paramId } = useLocalSearchParams();
	const { selectedId } = useTablet();
	const id = isTablet ? selectedId : getSingleParam(paramId);

	const queryClient = useQueryClient();
	const [modalInfo, setModalInfo] = useState<any>(undefined);

	const cachedSongs = queryClient.getQueryData<Song[]>(["allSongs"]);

	const {
		data: song,
		isLoading,
		isError,
	} = useQuery<Song | null>({
		queryKey: ["song", id],
		queryFn: async () => {
			const cachedSong = cachedSongs?.find((s) => s.id === id);
			if (cachedSong) return cachedSong;

			if (!id) throw new Error("No song ID provided!");
			return await getSong(id);
		},
		enabled: !!id,
	});

	const shows: Show[] = song?.shows ?? [];

	const navigation = useNavigation();
	useLayoutEffect(() => {
		if (isTablet) return; // skip header setup on tablet
		navigation.setOptions({
			title: song?.title ?? "Song Details",
			headerRight: () => (
				<Link href={generateHref("editSong", { id })}>
					<MaterialIcons size={24} name="edit" color="white" />
				</Link>
			),
		});
	}, [id, navigation, song, isTablet]);

	const renderInfo = (item: any, index: number) => {
		const isTouchable = item.opensModal;
		const Wrapper: React.ElementType = isTouchable ? TouchableOpacity : ThemedView;
		const labelText = isTouchable ? (
			<ThemedView style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
				<ThemedText style={{ fontSize: 12 }}>{item.label}</ThemedText>
				<MaterialIcons color={colors.text} size={12} name="open-in-new" />
			</ThemedView>
		) : (
			item.label
		);

		return (
			<Wrapper
				key={`song-data-${index}`}
				style={[styles.songItem, { width: `${85 / 4}%` }]}
				onPress={item.opensModal ? () => setModalInfo(item) : undefined}>
				<ThemedText style={styles.songItemText}>{labelText}</ThemedText>
				<ThemedText style={styles.songItemText}>{item.value}</ThemedText>
			</Wrapper>
		);
	};

	if (isLoading) {
		return (
			<ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator size="large" color={colors.text} />
			</ThemedView>
		);
	}

	if (isError || !id || !song) {
		return (
			<ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ThemedText>Song not found</ThemedText>
			</ThemedView>
		);
	}

	const COLUMNS = 4;
	const blockWidth = width * 0.9 / COLUMNS;

	const infoBlocks = [
		{ label: "Duration", value: formatDuration(song.duration) },
		{ label: "Shows", value: shows.length || "N/A", onPress: shows.length ? () => setModalInfo({ label: "Shows", modalValue: shows }) : undefined, opensModal: !!shows.length },
		{ label: "BPM", custom: <Metronome value={song.bpm} /> },
		{ label: "Key", custom: <Key originalKey={song.original_key} spKey={song.sp_key} /> },
		{ label: "Artist", value: song.artist.length },
		{ label: "Year", value: '2005' },
		{ label: "Notes", value: "..." },
	];

	return (
		<ThemedView style={{ flex: 1 }}>
			<ThemedView style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, paddingHorizontal: "1.5%", justifyContent: "center" }}>
				{infoBlocks.map((block, i) => (
					<InfoBlock key={i} {...block} width={blockWidth} />
				))}
			</ThemedView>

			<ThemedView style={styles.tagsContainer}>
				{song?.tags?.map((tag: TagType) => (
					<ThemedView key={tag.id} style={styles.individualTagContainer}>
						<Tag tag={tag} />
					</ThemedView>
				))}
			</ThemedView>

			<LyricsRenderer lyrics={song?.lyrics ?? ""} />

			<InfoModal modalInfo={modalInfo} setModalInfo={setModalInfo} />
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	tagsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		paddingHorizontal: "1.5%",
	},
	individualTagContainer: {
		padding: 2,
	},
	songItem: {
		flexDirection: "column",
		borderColor: "white",
		borderRadius: 8,
		alignItems: "center",
		padding: 6,
		borderWidth: 1,
	},
	songItemText: {
		fontSize: 12,
	},
});