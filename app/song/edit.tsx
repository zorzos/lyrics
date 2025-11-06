import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import {
	ActivityIndicator,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { supabase } from "@/lib/supabase";
import { TagType } from "@/types";

import AutocompleteInput from "@/components/ui/Autocomplete";
import KeyPicker from "@/components/ui/KeyPicker";
import { useColors } from "@/hooks/use-colors";
import { getSong } from "@/lib/queries/songs";
import getTags from "@/lib/queries/tags";
import { getSingleParam } from "@/utils/paramUtils";
import Toast from "react-native-toast-message";

type NewArtist = { isNew: true; name: string };
type Artist = NewArtist | string;

export default function EditSongScreen() {
	const colors = useColors();
	const queryClient = useQueryClient();
	const { id } = useLocalSearchParams();
	const router = useRouter();

	const [title, setTitle] = useState<string>("");
	const [artist, setArtist] = useState<Artist>("");
	const [duration, setDuration] = useState<number>(0);
	const [lyrics, setLyrics] = useState<string>("");
	const [availableTags, setAvailableTags] = useState<TagType[]>([]);
	const [selectedTagIds, setSelectedTagIds] = useState<Record<string, boolean>>(
		{}
	);
	const [originalKey, setOriginalKey] = useState<string>("");
	const [spKey, setSpKey] = useState<string>("");
	const [bpm, setBPM] = useState<number>(0);

	const [loading, setLoading] = useState<boolean>(false);
	const [fetchingSong, setFetchingSong] = useState<boolean>(false);

	const [ogKeyOpen, setOGKeyOpen] = useState<boolean>(false);
	const [spKeyOpen, setSPKeyOpen] = useState<boolean>(false);

	const navigation = useNavigation();
	useLayoutEffect(() => {
		navigation.setOptions({
			title: id ? "Edit Song" : "Add new Song",
		});
	}, [navigation, id]);

	useEffect(() => {
		async function fetchTags() {
			const result = await getTags();
			if (!result) console.error("Get tags failed");
			else setAvailableTags(result ?? []);
		}

		async function fetchSong() {
			if (!id) return;
			setFetchingSong(true);
			try {
				const singleId = getSingleParam(id);
				if (!singleId) throw new Error("Song not found");
				const result = await getSong(singleId);

				if (!result) console.error("Song not found");
				else {
					setTitle(result.title);
					setArtist(result.artist);
					setDuration(result.duration);
					setLyrics(result.lyrics ?? "");
					setOriginalKey(result.original_key ?? "");
					setSpKey(result.sp_key ?? "");

					const tagMap: Record<string, boolean> = {};
					result.tags?.forEach((st: any) => {
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

	const isArtistInput = (artist: Artist): artist is NewArtist => {
		return typeof artist === "object" && artist !== null && "isNew" in artist;
	}

	const showToastError = (label: string) => {
		Toast.show({
			type: "error",
			text1: label,
			position: "bottom",
			visibilityTime: 2000,
		});
	}

	const buildPayload = async () => {
		const trimmedTitle = title.trim();
		const requiredFields = [
			{ value: title.trim(), label: "Title" },
			{ value: originalKey, label: "Original key" },
			{ value: bpm, label: "BPM" },
			{ value: duration, label: "Duration" },
			// { value: lyrics, label: "Lyrics" },
		];

		const missing = requiredFields.find((f) => !f.value);

		if (missing) {
			showToastError(`${missing.label} is required`);
			return null;
		}

		let artistId: string | null = null;

		if (isArtistInput(artist)) {
			try {
				const { data, error } = await supabase
					.from("artists")
					.insert({ name: artist.name.trim() })
					.select("id")
					.single();
				if (error || !data) throw error;
				artistId = data.id;
			} catch (err) {
				showToastError("Failed to create artist in database");
				throw Error("Failed to create artist in database");
			}
		} else {
			artistId = artist;
		}

		if (!artistId) return showToastError("Artist ID is required");

		return {
			title: trimmedTitle,
			artist_id: artistId,
			duration,
			lyrics: lyrics?.trim() || "",
			original_key: originalKey?.trim() || "",
			sp_key: spKey?.trim() || undefined,
			bpm,
		};
	};

	const handleSave = async () => {
		const payload = await buildPayload();
		if (!payload) return;

		setLoading(true);
		try {
			let songId = id;
			if (id) {
				const { error } = await supabase
					.from("songs")
					.update(payload)
					.eq("id", id);
				if (error) throw error;

				await supabase.from("song_tags").delete().eq("song_id", id);
			} else {
				const { data, error } = await supabase
					.from("songs")
					.insert(payload)
					.select("id")
					.single();
				if (error) throw error;
				songId = data.id;
			}

			const newTags = Object.keys(selectedTagIds)
				.filter((k) => selectedTagIds[k])
				.map((tagId) => ({ song_id: songId, tag_id: tagId }));

			if (newTags.length) await supabase.from("song_tags").insert(newTags);

			await queryClient.invalidateQueries({ queryKey: ["allSongs"] });

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
				text1: `Error: ${e.message}`,
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
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior={Platform.OS === "ios" ? "padding" : undefined}>
			<ThemedView style={{ flex: 1, padding: 16 }}>
				{fetchingSong ? (
					<ActivityIndicator
						size="large"
						color={colors.text}
					/>
				) : (
					<>
						<ThemedText>Title</ThemedText>
						<TextInput
							style={[
								styles.input,
								{ color: colors.text, borderColor: colors.text }
							]}
							value={title}
							onChangeText={setTitle}
						/>

						<ThemedText>Artist</ThemedText>
						<AutocompleteInput
							value={artist}
							onChange={setArtist}
							fetchData={async () => {
								const { data } = await supabase
									.from("artists")
									.select("id, name")
									.order("name");
								return data || [];
							}}
							labelKey="name"
							valueKey="id"
							createItem={async (name: string) => {
								const { data } = await supabase
									.from("artists")
									.insert({ name })
									.select()
									.single();
								return data;
							}}
						/>


						<ThemedView
							style={{
								flexDirection: "row",
								gap: 12,
								justifyContent: "space-between",
							}}>
							<ThemedView style={{ flex: 1 }}>
								<ThemedText>Duration (seconds)</ThemedText>
								<TextInput
									style={[styles.input, { borderColor: colors.tint, color: colors.text }]}
									value={duration > 0 ? String(duration) : ""}
									onChangeText={(text) => {
										const numericValue = parseInt(text, 10);
										setDuration(!isNaN(numericValue) ? numericValue : 0);
									}}
									keyboardType="numeric"
								/>
							</ThemedView>

							<ThemedView style={{ flex: 1 }}>
								<ThemedText>BPM</ThemedText>
								<TextInput
									style={[styles.input, { borderColor: colors.tint, color: colors.text }]}
									value={bpm > 0 ? String(bpm) : ""}
									onChangeText={(text) => {
										const numericValue = parseInt(text, 10);
										setBPM(!isNaN(numericValue) ? numericValue : 0);
									}}
									keyboardType="numeric"
								/>
							</ThemedView>
						</ThemedView>

						{/* Keys */}
						<ThemedView style={styles.keysRow}>
							<KeyPicker
								open={ogKeyOpen}
								setOpen={(val) => {
									if (val) setSPKeyOpen(false);
									setOGKeyOpen(val);
									Keyboard.dismiss();
								}}
								label="Original Key"
								value={originalKey}
								onChange={(val) => {
									setOriginalKey(val);
									if (val === spKey) setSpKey("");
									Keyboard.dismiss();
								}}
								zIndex={5000}
								zIndexInverse={1000}
							/>
							<KeyPicker
								open={spKeyOpen}
								setOpen={(val) => {
									if (val) setOGKeyOpen(false);
									setSPKeyOpen(val);
									Keyboard.dismiss();
								}}
								label="New Key (optional)"
								value={spKey}
								onChange={(val) => {
									setSpKey(val === "none" ? "" : val);
									Keyboard.dismiss();
								}}
								removeKey={originalKey}
								extraOptions={[
									{
										label: "None",
										value: "none",
										containerStyle: {
											backgroundColor: colors.background,
										},
										labelStyle: {
											color: colors.text,
										},
									},
								]}
								zIndex={4000}
								zIndexInverse={2000}
							/>
						</ThemedView>

						<ThemedText>Lyrics</ThemedText>
						<TextInput
							style={[styles.input, { height: 120, borderColor: colors.tint, color: colors.text }]}
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
					</>
				)}
			</ThemedView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	input: {
		borderWidth: 1,
		borderRadius: 6,
		padding: 8,
		marginBottom: 12,
	},
	keysRow: {
		flexDirection: "row",
		gap: 12,
		marginBottom: 12,
		overflow: 'visible'
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
