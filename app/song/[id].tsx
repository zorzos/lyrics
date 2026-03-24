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
import { ActivityIndicator, StyleSheet } from "react-native";

import InfoBlock from "@/components/ui/InfoBlock";
import Key from "@/components/ui/Key";
import { useColors } from "@/hooks/use-colors";
import { getSong } from "@/lib/queries/songs";
import { width } from "@/utils/utils";

export default function SongDetailScreen() {
	const colors = useColors();
	const { id } = useLocalSearchParams();
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
			// Check cache first
			const cachedSong = cachedSongs?.find((s) => s.id === id);
			if (cachedSong) return cachedSong;

			const singleId = getSingleParam(id);
			if (!singleId) throw new Error("No song ID provided!");

			// Fetch from Supabase
			return await getSong(singleId);
		},
		enabled: !!id,
	});

	const shows: Show[] = song?.shows ?? [];

	const navigation = useNavigation();
	useLayoutEffect(() => {
		navigation.setOptions({
			title: song?.title ?? "Song Details",
			headerRight: () => (
				<Link href={generateHref("editSong", { id })}>
					<MaterialIcons
						size={24}
						name="edit"
						color="white"
					/>
				</Link>
			),
		});
	}, [id, navigation, song]);

	if (isLoading) {
		return (
			<ThemedView
				style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator
					size="large"
					color={colors.text}
				/>
			</ThemedView>
		);
	}

	if (isError || !id || !song) {
		return (
			<ThemedView
				style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ThemedText>Song not found</ThemedText>
			</ThemedView>
		);
	}

	const COLUMNS = 4;
	const blockWidth = (width * 0.9) / COLUMNS;

	const infoBlocks = [
		{ label: "Duration", value: formatDuration(song.duration) },
		{
			label: `Show${shows.length > 1 ? "s" : ""}`,
			value: shows.length || "N/A",
			onPress: shows.length
				? () =>
						setModalInfo({
							title: "Shows",
							modalValue: shows.map(
								(show) =>
									`${show.title} - ${new Date(show.date).toLocaleDateString()}`,
							),
						})
				: undefined,
			opensModal: shows.length > 0,
		},
		{
			label: "BPM",
			custom: (
				<Metronome
					containerStyle={{
						borderColor: colors.text,
						width: blockWidth,
					}}
					value={song.bpm}
				/>
			),
		},
		{
			label: "Key",
			custom: (
				<Key
					originalKey={song.original_key}
					spKey={song.sp_key}
					containerStyle={{
						borderColor: colors.text,
						width: blockWidth,
					}}
				/>
			),
		},
		{
			label: `Artist${song.artist.length > 1 ? "s" : ""}`,
			value: song.artist.length,
			onPress: () =>
				setModalInfo({
					title: "Artists",
					modalValue: song.artist.map((artist) => artist.name),
				}),
			opensModal: true,
		},
		{ label: "Year", value: "2005" },
		{
			label: "Notes",
			value: song.bpm ?? "N/A",
			onPress: () =>
				setModalInfo({
					title: "Notes",
					modalValue: "SOME NOTES HERE",
				}),
			opensModal: true,
		},
	];

	return (
		<ThemedView style={{ flex: 1 }}>
			<ThemedView
				style={{
					flexDirection: "row",
					flexWrap: "wrap",
					gap: 4,
					paddingHorizontal: "1.5%",
					justifyContent: "center",
				}}>
				{infoBlocks.map((block, i) => (
					<InfoBlock
						key={i}
						{...block}
						width={blockWidth}
					/>
				))}
			</ThemedView>

			<ThemedView style={styles.tagsContainer}>
				{song?.tags?.map((tag: TagType) => (
					<ThemedView
						key={tag.id}
						style={styles.individualTagContainer}>
						<Tag tag={tag} />
					</ThemedView>
				))}
			</ThemedView>

			<LyricsRenderer lyrics={song?.lyrics ?? ""} />

			<InfoModal
				modalInfo={modalInfo}
				setModalInfo={setModalInfo}
			/>
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
	songDataItemContainer: {
		flexDirection: "row",
		justifyContent: "space-evenly",
		marginBottom: 8,
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
