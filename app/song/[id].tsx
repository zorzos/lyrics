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

import Key from "@/components/ui/Key";
import { useColors } from "@/hooks/use-colors";
import { getSong } from "@/lib/queries/songs";

export default function SongDetailScreen() {
	const colors = useColors();
	const { id } = useLocalSearchParams();
	const queryClient = useQueryClient();

	const [modalInfo, setModalInfo] = useState<any>(undefined);

	// Try to get the song from cache first
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

	const finalShows: Show[] = song?.shows ?? [];
	const finalTags: TagType[] = song?.tags ?? [];
	const durationNumber = Number(song?.duration);

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

	const renderInfo = (item: any, index: number) => {
		const isTouchable = item.opensModal;
		const Wrapper: React.ElementType = isTouchable
			? TouchableOpacity
			: ThemedView;
		const labelText = isTouchable ? (
			<ThemedView
				style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
				<ThemedText style={{ fontSize: 12 }}>{item.label}</ThemedText>
				<MaterialIcons
					color={colors.text}
					size={12}
					name="open-in-new"
				/>
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

	const songDataComponents = [
		renderInfo(
			{
				label: "Duration",
				value: formatDuration(durationNumber),
			},
			0
		),
		renderInfo(
			{
				label: "Shows",
				value: finalShows.length,
				modalValue: finalShows,
				opensModal: finalShows.length,
			},
			1
		),
		<Metronome
			key={2}
			value={120}
			containerStyle={{ borderColor: colors.text, width: `${85 / 4}%` }}
			contentStyle={{ fontSize: 12 }}
		/>,
		<Key
			key={3}
			originalKey={song.original_key}
			spKey={song.sp_key}
			containerStyle={{ borderColor: colors.text, width: `${85 / 4}%` }}
		/>,
	];

	console.log("SONG ARTIST(S)", song.artist);

	return (
		<ThemedView style={{ flex: 1 }}>
			<ThemedView style={styles.songDataItemContainer}>
				{songDataComponents}
			</ThemedView>
			<ThemedView style={styles.songDataItemContainer}>
				{renderInfo(
					{
						label: "Artist",
						value: song.artist.length,
					},
					0
				)}
				{renderInfo(
					{
						label: "Year",
						value: 2005,
						opensModal: false,
					},
					1
				)}
			</ThemedView>

			<ThemedView style={styles.tagsContainer}>
				{finalTags.map((tag: TagType) => (
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
