import { useTheme } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import {
	ActivityIndicator,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { supabase } from "@/lib/supabase";
import { Song, TagType } from "@/types";

import Toast from "react-native-toast-message";

export default function EditSongScreen() {
	const { colors } = useTheme();
	const queryClient = useQueryClient();
	const { id } = useLocalSearchParams(); // optional, for edit
	const router = useRouter();

	const [title, setTitle] = useState("");
	const [artist, setArtist] = useState("");
	const [duration, setDuration] = useState(""); // store as seconds or mm:ss string
	const [lyrics, setLyrics] = useState("");
	const [availableTags, setAvailableTags] = useState<TagType[]>([]);
	const [selectedTagIds, setSelectedTagIds] = useState<Record<string, boolean>>(
		{}
	);

	const [loading, setLoading] = useState(false);
	const [fetchingSong, setFetchingSong] = useState(false);

	const navigation = useNavigation();
	useLayoutEffect(() => {
		navigation.setOptions({
			title: id ? "Edit Song" : "Add new Song",
		});
	}, [navigation, id]);

	// Fetch tags and song data (if editing)
	useEffect(() => {
		async function fetchTags() {
			const { data, error } = await supabase.from("tags").select("*");
			if (error) console.error(error);
			else setAvailableTags(data ?? []);
		}

		async function fetchSong() {
			if (!id) return;
			setFetchingSong(true);
			try {
				const { data, error } = await supabase
					.from("songs")
					.select(
						`id,title,artist,duration,lyrics,song_tags(tags(id,name,color))`
					)
					.eq("id", id)
					.single();

				if (error) console.error(error);
				else if (data) {
					setTitle(data.title);
					setArtist(data.artist);
					setDuration(data.duration?.toString() ?? "");
					setLyrics(data.lyrics ?? "");

					// select tags
					const tagMap: Record<string, boolean> = {};
					data.song_tags?.forEach((st: any) => {
						if (st.tags) {
							const tagsArray = Array.isArray(st.tags) ? st.tags : [st.tags];
							tagsArray.forEach((tag: TagType) => {
								tagMap[tag.id] = true;
							});
						}
					});
					setSelectedTagIds(tagMap);
				}
			} finally {
				setFetchingSong(false);
			}
		}

		fetchTags();
		fetchSong();
	}, [id]);

	const parseDurationToSeconds = (text: string): number | null => {
		if (!text) return null;
		const trimmed = text.trim();
		if (trimmed.includes(":")) {
			const [mm, ss] = trimmed.split(":").map(Number);
			if (!isNaN(mm) && !isNaN(ss)) return mm * 60 + ss;
			return null;
		}
		const n = Number(trimmed);
		return Number.isNaN(n) ? null : n;
	};

	const buildPayload = (): Omit<Song, "id"> | null => {
		if (!title.trim()) {
			Toast.show({
				type: "error",
				text1: "Title is required",
				position: "bottom",
				visibilityTime: 2000,
			});
			return null;
		}

		if (!artist.trim()) {
			Toast.show({
				type: "error",
				text1: "Artist is required",
				position: "bottom",
				visibilityTime: 2000,
			});
			return null;
		}

		return {
			title: title.trim(),
			artist: artist.trim(),
			duration: parseDurationToSeconds(duration),
			lyrics: lyrics || "",
		};
	};

	const handleSave = async () => {
		const payload = buildPayload();
		if (!payload) return;

		setLoading(true);
		try {
			if (id) {
				// update
				const { error } = await supabase
					.from("songs")
					.update(payload)
					.eq("id", id);
				if (error) throw error;

				// update song_tags
				await supabase.from("song_tags").delete().eq("song_id", id);
				const newTags = Object.keys(selectedTagIds)
					.filter((k) => selectedTagIds[k])
					.map((tagId) => ({
						song_id: id,
						tag_id: tagId,
					}));
				if (newTags.length) await supabase.from("song_tags").insert(newTags);
			} else {
				// insert
				const { data, error } = await supabase
					.from("songs")
					.insert(payload)
					.select("id")
					.single();
				if (error) throw error;

				const songId = data?.id;
				const newTags = Object.keys(selectedTagIds)
					.filter((k) => selectedTagIds[k])
					.map((tagId) => ({
						song_id: songId,
						tag_id: tagId,
					}));
				if (newTags.length) await supabase.from("song_tags").insert(newTags);
			}

			const idString = Array.isArray(id) ? id[0] : id;
			await queryClient.invalidateQueries({ queryKey: ["allSongs"] });
			// Update cache
			queryClient.setQueryData<Song[]>(["allSongs"], (oldData) => {
				if (!oldData) return [{ id: idString!, ...payload } as Song];

				return oldData.map((song) =>
					song.id === idString ? { ...song, ...payload } : song
				);
			});

			router.back();
			Toast.show({
				type: "success",
				text1: "Song saved!",
				position: "bottom",
				visibilityTime: 2000,
			});
		} catch (e: any) {
			console.error(e);
			Toast.show({
				type: "error",
				text1: `Error, ${e.message}` || "Failed to save song",
				position: "bottom",
				visibilityTime: 2000,
			});
		} finally {
			setLoading(false);
		}
	};

	const toggleTag = (tagId: string) => {
		setSelectedTagIds((prev) => ({ ...prev, [tagId]: !prev[tagId] }));
	};

	return (
		<ThemedView
			style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
			{fetchingSong ? (
				<ActivityIndicator
					size="large"
					color={colors.primary}
				/>
			) : (
				<ScrollView
					style={styles.container}
					contentContainerStyle={{ padding: 16 }}>
					<ThemedText>Title</ThemedText>
					<TextInput
						style={[styles.input, { color: colors.text }]}
						value={title}
						onChangeText={setTitle}
					/>

					<ThemedText>Artist</ThemedText>
					<TextInput
						style={[styles.input, { color: colors.text }]}
						value={artist}
						onChangeText={setArtist}
					/>

					<ThemedText>Duration (seconds or mm:ss)</ThemedText>
					<TextInput
						style={[styles.input, { color: colors.text }]}
						value={duration}
						onChangeText={setDuration}
						keyboardType="numeric"
					/>

					<ThemedText>Lyrics</ThemedText>
					<TextInput
						style={[styles.input, { height: 120, color: colors.text }]}
						value={lyrics}
						onChangeText={setLyrics}
						multiline
					/>

					<ThemedText>Tags</ThemedText>
					<ThemedView
						style={[
							styles.tagsContainer,
							{ backgroundColor: colors.background },
						]}>
						{availableTags.map((tag) => (
							<TouchableOpacity
								key={tag.id}
								style={[
									styles.tagCheckbox,
									selectedTagIds[tag.id] && {
										backgroundColor: tag.color || "#00F",
									},
								]}
								onPress={() => toggleTag(tag.id)}>
								<Text
									style={{ color: selectedTagIds[tag.id] ? "#FFF" : "#999" }}>
									{tag.name}
								</Text>
							</TouchableOpacity>
						))}
					</ThemedView>

					<TouchableOpacity
						style={styles.saveButton}
						onPress={handleSave}
						disabled={loading}>
						<ThemedText style={{ color: "#FFF", textAlign: "center" }}>
							{loading ? "Saving..." : "Save"}
						</ThemedText>
					</TouchableOpacity>
				</ScrollView>
			)}
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	input: {
		borderWidth: 1,
		borderColor: "#999",
		borderRadius: 6,
		padding: 8,
		marginBottom: 12,
	},
	tagsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		marginBottom: 16,
	},
	tagCheckbox: {
		borderWidth: 1,
		borderColor: "#999",
		borderRadius: 4,
		paddingVertical: 4,
		paddingHorizontal: 8,
		margin: 4,
	},
	saveButton: {
		backgroundColor: "#007AFF",
		paddingVertical: 12,
		borderRadius: 6,
		marginTop: 12,
	},
});
