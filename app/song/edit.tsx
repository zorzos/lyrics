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
import { AutocompleteItem, NewArtist, TagType } from "@/types";

import AutocompleteInput from "@/components/ui/Autocomplete";
import KeyPicker from "@/components/ui/KeyPicker";
import { useColors } from "@/hooks/use-colors";
import { getSong, insertSong, updateSong } from "@/lib/queries/songs";
import getTags from "@/lib/queries/tags";
import { getSingleParam } from "@/utils/paramUtils";
import Toast from "react-native-toast-message";

const allArtists: AutocompleteItem[] = [
	{ id: "1", label: "Artist 1", isNew: false },
	{ id: "2", label: "Artist 2", isNew: false },
	{ id: "3", label: "Test artist", isNew: false },
	{ id: "4", label: "Another artist", isNew: false },
	{ id: "5", label: "Sample artist", isNew: false },
];

export default function EditSongScreen() {
	const colors = useColors();
	const queryClient = useQueryClient();
	const { id } = useLocalSearchParams();
	const router = useRouter();

	const [tempTitle, setTitle] = useState<string>("");
	const [selectedArtists, setSelectedArtists] = useState<AutocompleteItem[]>(
		[]
	);
	const [duration, setDuration] = useState<number>(0);
	const [lyrics, setLyrics] = useState<string>("");
	const [availableTags, setAvailableTags] = useState<TagType[]>([]);
	const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
	const [originalKey, setOriginalKey] = useState<string>("");
	const [spKey, setSpKey] = useState<string>("");
	const [bpm, setBPM] = useState<number>(0);

	const [loading, setLoading] = useState<boolean>(false);
	const [tagsLoading, setTagsLoading] = useState<boolean>(false);
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
			setTagsLoading(true);
			const result = await getTags();
			if (!result) console.error("Get tags failed");
			else setAvailableTags(result ?? []);
			setTagsLoading(false);
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
					// setArtist(result.artist);
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
					// setSelectedTagIds(tagMap);
				}
			} finally {
				setFetchingSong(false);
			}
		}

		fetchTags();
		fetchSong();
	}, [id]);

	const showToastError = (label: string) => {
		Toast.show({
			type: "error",
			text1: label,
			position: "top",
			visibilityTime: 2500,
			topOffset: 80,
		});
	};

	const buildPayload = async () => {
		const title = tempTitle.trim();
		const requiredFields = [
			{ value: title, label: "Title" },
			{ value: selectedArtists.length, label: "Artist" },
			{ value: duration, label: "Duration" },
			{ value: bpm, label: "BPM" },
			{ value: originalKey, label: "Original key" },
			// { value: lyrics, label: "Lyrics" },
		];

		const missing = requiredFields.find((f) => !f.value);

		if (missing) {
			showToastError(`${missing.label} is required`);
			return null;
		}

		// CALL SUPABASE FOR NEW ARTISTS TO CREATE THEM
		const newArtists = selectedArtists.filter((item) => item.isNew);
		let createdArtists: NewArtist[] = [];
		if (newArtists.length) {
			const artistsToCreate = newArtists
				.map(({ id, isNew, ...rest }) => rest)
				.map(({ label, ...restRenamed }) => ({
					name: label,
					...restRenamed,
				}));

			// const newlyCreatedArtists = await insertArtist(artistsToCreate);
			// createdArtists.push(
			// 	...newlyCreatedArtists.map((newArtist: Artist) =>
			// 		newArtist.id.toString()
			// 	)
			// );
		}

		// MANIPULATE EXISTING ARTISTS
		const existingIDs = selectedArtists
			.filter((item) => !item.isNew)
			.map((item: any) => item.id);

		// COMBINE NEW AND EXISTING
		const consolidatedArtists = [...createdArtists, ...existingIDs];

		return {
			title,
			duration,
			bpm,
			originalKey,
			spKey,
			artists: consolidatedArtists,
			tags: selectedTagIds,
		};
	};

	const handleSave = async () => {
		setLoading(true);
		const payload = await buildPayload();
		if (!payload) return;

		console.log("PAYLOAD", payload);
		try {
			if (id) {
				await updateSong(payload);
			} else {
				await insertSong(payload);
			}
		} catch (error: any) {
			const message = error.message;
			console.error(`Error: ${message}`);
			Toast.show({
				type: "error",
				text1: message,
				position: "top",
				visibilityTime: 2500,
			});
		} finally {
			await queryClient.invalidateQueries({ queryKey: ["allSongs"] });
			router.back();
			setLoading(false);
		}
		// try {
		// 	let songId = id;
		// 	if (id) {
		// 		const { error } = await supabase
		// 			.from("songs")
		// 			.update(payload)
		// 			.eq("id", id);
		// 		if (error) throw error;

		// 		await supabase.from("song_tags").delete().eq("song_id", id);
		// 	} else {
		// 		const { data, error } = await supabase
		// 			.from("songs")
		// 			.insert(payload)
		// 			.select("id")
		// 			.single();
		// 		if (error) throw error;
		// 		songId = data.id;
		// 	}

		// 	const newTags = Object.keys(selectedTagIds)
		// 		.filter((k) => selectedTagIds[k])
		// 		.map((tagId) => ({ song_id: songId, tag_id: tagId }));

		// 	if (newTags.length) await supabase.from("song_tags").insert(newTags);

		// 	await queryClient.invalidateQueries({ queryKey: ["allSongs"] });

		// 	router.back();
		// 	Toast.show({
		// 		type: "success",
		// 		text1: "Song saved!",
		// 		position: "bottom",
		// 		visibilityTime: 2000,
		// 	});
		// } catch (e: any) {
		// 	console.error(e);
		// 	Toast.show({
		// 		type: "error",
		// 		text1: `Error: ${e.message}`,
		// 		position: "bottom",
		// 		visibilityTime: 2000,
		// 	});
		// } finally {
		// 	setLoading(false);
		// }
	};

	const toggleTag = (tagId: string) => {
		setSelectedTagIds(
			(prev) =>
				prev.includes(tagId)
					? prev.filter((id) => id !== tagId) // removes
					: [...prev, tagId] // adds
		);
	};

	const renderTags = () => {
		if (tagsLoading)
			return (
				<ThemedView style={{ flex: 1 }}>
					<ActivityIndicator
						size="large"
						color={colors.text}
					/>
				</ThemedView>
			);
		else
			return availableTags.map((tag) => (
				<TouchableOpacity
					key={tag.id}
					style={[
						styles.tagCheckbox,
						selectedTagIds.includes(tag.id) && {
							backgroundColor: tag.color || "#00F",
						},
					]}
					onPress={() => toggleTag(tag.id)}>
					<Text
						style={{
							color: selectedTagIds.includes(tag.id) ? "#FFF" : "#999",
						}}>
						{tag.name}
					</Text>
				</TouchableOpacity>
			));
	};

	return (
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior={Platform.OS === "ios" ? "padding" : undefined}>
			<ThemedView style={{ flex: 1, padding: 8 }}>
				{fetchingSong ? (
					<ActivityIndicator
						size="large"
						color={colors.text}
					/>
				) : (
					<ThemedView
						style={{
							justifyContent: "space-between",
							flex: 1,
						}}>
						<ThemedView>
							<ThemedText>Title</ThemedText>
							<TextInput
								style={[
									styles.input,
									{ color: colors.text, borderColor: colors.text },
								]}
								value={tempTitle}
								onChangeText={setTitle}
								placeholder="Enter title"
								placeholderTextColor={colors.placeholder}
							/>

							<ThemedText>Artist</ThemedText>
							<AutocompleteInput
								value={selectedArtists}
								onChange={setSelectedArtists}
								data={allArtists}
								placeholder="Select artist"
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
										style={[
											styles.input,
											{ borderColor: colors.tint, color: colors.text },
										]}
										value={duration > 0 ? String(duration) : ""}
										onChangeText={(text) => {
											const numericValue = parseInt(text, 10);
											setDuration(!isNaN(numericValue) ? numericValue : 0);
										}}
										keyboardType="numeric"
										placeholder="Enter duration"
										placeholderTextColor={colors.placeholder}
									/>
								</ThemedView>

								<ThemedView style={{ flex: 1 }}>
									<ThemedText>BPM</ThemedText>
									<TextInput
										style={[
											styles.input,
											{ borderColor: colors.tint, color: colors.text },
										]}
										value={bpm > 0 ? String(bpm) : ""}
										onChangeText={(text) => {
											const numericValue = parseInt(text, 10);
											setBPM(!isNaN(numericValue) ? numericValue : 0);
										}}
										keyboardType="numeric"
										placeholder="Enter BPM"
										placeholderTextColor={colors.placeholder}
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
								style={[
									styles.input,
									{ height: 120, borderColor: colors.tint, color: colors.text },
								]}
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
								{renderTags()}
							</ThemedView>
						</ThemedView>

						<TouchableOpacity
							style={styles.saveButton}
							onPress={handleSave}
							disabled={loading}>
							<ThemedText style={{ color: "#FFF", textAlign: "center" }}>
								{loading ? "Saving..." : "Save"}
							</ThemedText>
						</TouchableOpacity>
					</ThemedView>
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
		marginBottom: "2.5%",
		overflow: "visible",
	},
	tagsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
	},
	tagCheckbox: {
		borderWidth: 1,
		borderColor: "#999",
		borderRadius: 4,
		paddingVertical: 4,
		paddingHorizontal: 8,
		margin: "1%",
	},
	saveButton: {
		backgroundColor: "#007AFF",
		paddingVertical: 12,
		borderRadius: 6,
		marginTop: 12,
		marginBottom: "7.5%",
	},
});
