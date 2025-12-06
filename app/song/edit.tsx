import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import {
	ActivityIndicator,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	TextInput,
	TouchableOpacity,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Artist, AutocompleteItem, NewArtist } from "@/types";

import AutocompleteInput from "@/components/ui/Autocomplete";
import KeyPicker from "@/components/ui/KeyPicker";
import { useColors } from "@/hooks/use-colors";
import { useArtists } from "@/hooks/useArtists";
import { useInsertSong, useSong } from "@/hooks/useSongs";
import { useTags } from "@/hooks/useTags";
import { insertArtists } from "@/lib/queries/artists";
import { getSingleParam } from "@/utils/paramUtils";
import { showErrorToast } from "@/utils/toastUtils";

export default function EditSongScreen() {
	const colors = useColors();
	const { id } = useLocalSearchParams();
	const songId = getSingleParam(id);
	const router = useRouter();

	const { data: tags, isLoading: isTagsLoading } = useTags();
	const { data: availableArtists, isLoading: isArtistsLoading } = useArtists();
	const { data: song, isLoading: isSongLoading } = useSong(songId || "");

	const insertSongMutation = useInsertSong();

	const [tempTitle, setTitle] = useState<string>("");
	const [selectedArtists, setSelectedArtists] = useState<AutocompleteItem[]>(
		[]
	);
	const [duration, setDuration] = useState<number>(0);
	const [lyrics, setLyrics] = useState<string>("");
	const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
	const [originalKey, setOriginalKey] = useState<string>("");
	const [spKey, setSpKey] = useState<string>("");
	const [bpm, setBPM] = useState<number>(0);

	const [loading, setLoading] = useState<boolean>(false);
	const [ogKeyOpen, setOGKeyOpen] = useState<boolean>(false);
	const [spKeyOpen, setSPKeyOpen] = useState<boolean>(false);

	const navigation = useNavigation();
	useLayoutEffect(() => {
		navigation.setOptions({
			title: id ? "Edit Song" : "Add new Song",
		});
	}, [navigation, id]);

	useEffect(() => {
		if (!song) return;

		setTitle(song.title);
		setDuration(song.duration ?? 0);
		setLyrics(song.lyrics ?? "");
		setOriginalKey(song.original_key ?? "");
		setSpKey(song.sp_key ?? "");
		setBPM(song.bpm ?? 0);
		setSelectedArtists(
			song.artist.map((a) => ({
				id: a.id,
				label: a.name,
				isNew: false,
			}))
		);
		setSelectedTagIds(song.tags?.map((t) => t.id) ?? []);
	}, [song]);

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
			showErrorToast(`${missing.label} is required`);
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

			const newlyCreatedArtists = await insertArtists(artistsToCreate);
			createdArtists.push(
				...newlyCreatedArtists.map((newArtist: Artist) =>
					newArtist.id.toString()
				)
			);
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
		const payload = await buildPayload();
		if (!payload) return;

		try {
			setLoading(true);

			if (!songId) {
				await insertSongMutation.mutateAsync(payload);
			} else {
				showErrorToast("Update implementation pending!");
			}

			router.back();
		} catch (error: any) {
			showErrorToast(error.message);
		} finally {
			setLoading(false);
		}
	};

	// const handleSave = async () => {
	// 	setLoading(true);
	// 	const payload = await buildPayload();
	// 	if (!payload) return;

	// 	try {
	// 		if (id) await updateSong(payload);
	// 		else await insertSong(payload);
	// 	} catch (error: any) {
	// 		const message = error.message;
	// 		console.error(`Error: ${message}`);
	// 		showErrorToast(message);
	// 	} finally {
	// 		await queryClient.invalidateQueries({ queryKey: ["allSongs"] });
	// 		router.back();
	// 		setLoading(false);
	// 		const message = id ? "updated" : "created";
	// 		showSuccessToast(`Song successfully ${message}`);
	// 	}
	// };

	const toggleTag = (tagId: string) => {
		setSelectedTagIds(
			(prev) =>
				prev.includes(tagId)
					? prev.filter((id) => id !== tagId) // removes
					: [...prev, tagId] // adds
		);
	};

	const loadingComponent = (
		<ThemedView style={{ flex: 1 }}>
			<ActivityIndicator
				size="large"
				color={colors.text}
			/>
		</ThemedView>
	);

	const renderArtists = () => {
		if (isArtistsLoading) return loadingComponent;
		else
			return (
				<AutocompleteInput
					value={selectedArtists}
					onChange={setSelectedArtists}
					data={
						availableArtists?.map((item) => ({
							...item,
							label: item.name,
							isNew: false,
						})) ?? []
					}
					placeholder="Select artist"
				/>
			);
	};

	const renderTags = () => {
		if (isTagsLoading) return loadingComponent;
		else {
			return tags?.map((tag) => (
				<TouchableOpacity
					key={tag.id}
					style={[
						styles.tagCheckbox,
						selectedTagIds.includes(tag.id) && {
							backgroundColor: tag.color || "#00F",
						},
					]}
					onPress={() => toggleTag(tag.id)}>
					<ThemedText
						style={{
							color: selectedTagIds.includes(tag.id) ? "#FFF" : "#999",
						}}>
						{tag.name}
					</ThemedText>
				</TouchableOpacity>
			));
		}
	};

	return (
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior={Platform.OS === "ios" ? "padding" : undefined}>
			<ThemedView style={{ flex: 1, padding: 8 }}>
				{isSongLoading ? (
					loadingComponent
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
							{renderArtists()}

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
