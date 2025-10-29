import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import InfoModal from "@/components/ui/InfoModal";
import LyricsRenderer from "@/components/ui/LyricsRenderer";
import Metronome from "@/components/ui/Metronome";
import Tag from "@/components/ui/Tag";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Show, Song, TagType } from "@/types";
import { formatDuration } from "@/utils/dateUtils";
import { generateHref } from "@/utils/paramUtils";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Link, useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";

import { supabase } from "@/lib/supabase";

export default function SongDetailScreen() {
	const colorScheme = useColorScheme();
	const currentTheme = Colors[colorScheme ?? "light"];
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

			// Fetch from Supabase
			const { data, error } = await supabase
				.from("songs")
				.select(`*, show_songs(*), song_tags(*, tags(*))`)
				.eq("id", id)
				.single();
			if (error) {
				console.error(error);
				return error;
			}

			const transformed = {
				...data,
				tags: (data.song_tags ?? []).map((st: any) => st.tags),
			};

			return transformed ?? null;
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

	const songData = [
		{
			label: "Duration",
			value: formatDuration(durationNumber),
			opensModal: false,
		},
		{
			label: "Shows",
			value: finalShows.length,
			modalValue: finalShows,
			opensModal: true,
		},
		0,
		{
			label: "Key (-2)",
			value: (
				<ThemedView
					style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
					<ThemedText style={{ fontSize: 12 }}>A</ThemedText>
					<MaterialIcons
						size={20}
						name="arrow-right-alt"
						color="white"
					/>
					<ThemedText style={{ fontSize: 12 }}>C</ThemedText>
				</ThemedView>
			),
			opensModal: false,
		},
	];

	const songDataComponents = [
		<Metronome
			key={2}
			label="BPM"
			value={120}
			containerStyle={{ borderColor: "white", width: `${85 / 4}%` }}
			contentStyle={{ fontSize: 12 }}
		/>,
	];

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
					color={currentTheme.text}
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
				style={[
					styles.songItem,
					{ width: `${85 / songData.length}%`, borderWidth: 1 },
				]}
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
					color={currentTheme.text}
				/>
			</ThemedView>
		);
	}

	if (isError || !song) {
		return (
			<ThemedView
				style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ThemedText>Song not found</ThemedText>
			</ThemedView>
		);
	}

	return (
		<>
			<ThemedView style={styles.songDataItemContainer}>
				{[songData[0], songData[1], null, songData[3]].map((item, index) =>
					index === 2 ? songDataComponents[0] : renderInfo(item, index)
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
		</>
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
	},
	songItemText: {
		fontSize: 12,
	},
});
