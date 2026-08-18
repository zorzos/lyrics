import { usePreventRemove } from "@react-navigation/native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import {
	ActivityIndicator,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	TextInput,
	TouchableOpacity,
} from "react-native";

import { useColors } from "@/hooks/use-colors";
import { useArtists, useInsertArtists } from "@/hooks/useArtists";
import { useSong, useUpsertSong } from "@/hooks/useSongs";
import { useTags } from "@/hooks/useTags";
import { getSingleParam, validate } from "@/utils/paramUtils";
import { showErrorToast, showSuccessToast } from "@/utils/toastUtils";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import AutocompleteInput from "@/components/ui/Autocomplete";
import ConfirmModal from "@/components/ui/ConfirmModal";
import KeyPicker from "@/components/ui/KeyPicker";

import { useTablet } from "@/context/TabletContext";
import { useDevice } from "@/hooks/use-device";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { AutocompleteItem } from "@/types";
import { Field, useForm } from "@tanstack/react-form";

const styles = StyleSheet.create({
	input: {
		borderWidth: 1,
		borderRadius: 6,
		padding: 8,
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

export default function EditSongScreen() {
	const colors = useColors();
	const { isTablet } = useDevice();
	const { id: paramId } = useLocalSearchParams();
	const { selectedId, setIsEditing, setIsAdding, discardRef } = useTablet();
	const songId = isTablet ? (selectedId ?? undefined) : getSingleParam(paramId);

	const router = useRouter();
	const navigation = useNavigation();

	const {
		isDirty,
		setIsDirty,
		confirmDiscard,
		isModalVisible,
		handleConfirm,
		handleCancel
	} = useUnsavedChanges();

	const { data: tags, isLoading: isTagsLoading } = useTags();
	const { data: availableArtists, isLoading: isArtistsLoading } = useArtists();
	const { data: song, isLoading: isSongLoading } = useSong(songId || "");

	const upsertSong = useUpsertSong();
	const insertArtistMutation = useInsertArtists();

	const [loading, setLoading] = useState<boolean>(false);
	const [ogKeyOpen, setOGKeyOpen] = useState<boolean>(false);
	const [spKeyOpen, setSPKeyOpen] = useState<boolean>(false);

	usePreventRemove(!isTablet && isDirty, () => {
		confirmDiscard(() => router.dismiss());
	});

	useLayoutEffect(() => {
		if (isTablet) return;
		navigation.setOptions({
			title: paramId ? "Edit Song" : "Add new Song",
		});
	}, [navigation, paramId, isTablet]);

	const handleDiscard = useCallback((onAfterDiscard?: () => void) => {
		confirmDiscard(() => {
			setIsDirty(false);
			if (isTablet) {
				setIsEditing(false);
				setIsAdding(false);
			} else {
				router.back();
			}
			onAfterDiscard?.();
		});
	}, [confirmDiscard, isTablet, setIsEditing, setIsAdding, router, setIsDirty]);

	useEffect(() => {
		if (!isTablet) return;
		discardRef.current = handleDiscard;
		return () => {
			discardRef.current = null;
		};
	}, [handleDiscard, isTablet, discardRef]);

	const markDirty = () => setIsDirty(true);

	const form = useForm({
		defaultValues: {
			title: "",
			duration: 0,
			bpm: 0,
			lyrics: "",
			originalKey: "",
			spKey: "",
			selectedArtists: [] as AutocompleteItem[],
			selectedTagIds: [] as string[],
		},
		validators: {
			onSubmit: validate,
		},
		onSubmit: async ({ value }) => {
			try {
				setLoading(true);
				const newArtists = value.selectedArtists.filter((a) => a.isNew);
				let createdArtists: string[] = [];

				if (newArtists.length) {
					const artistsToCreate = newArtists.map(({ label, ...rest }) => ({
						name: label,
						...rest,
					}));
					const createdNewArtists =
						await insertArtistMutation.mutateAsync(artistsToCreate);
					createdArtists.push(
						...createdNewArtists.map((a: any) => a.id.toString()),
					);
				}

				const existingIDs = value.selectedArtists
					.filter((item) => !item.isNew)
					.map((item: any) => item.id);

				const consolidatedArtists = [...createdArtists, ...existingIDs];
				await upsertSong.mutateAsync({
					id: songId,
					payload: {
						title: value.title.trim(),
						duration: value.duration,
						bpm: value.bpm,
						originalKey: value.originalKey,
						spKey: value.spKey,
						artists: consolidatedArtists,
						tags: value.selectedTagIds,
						lyrics: value.lyrics,
					},
				});

				showSuccessToast("Song successfully saved!");
				setIsDirty(false);
				if (isTablet) {
					setIsEditing(false);
					setIsAdding(false);
				} else {
					router.back();
				}
			} catch (error: any) {
				showErrorToast(error.message);
			} finally {
				setLoading(false);
			}
		},
	});

	useEffect(() => {
		if (!song) return;
		form.setFieldValue("title", song.title);
		form.setFieldValue("duration", song.duration);
		form.setFieldValue("bpm", song.bpm);
		form.setFieldValue("lyrics", song.lyrics);
		form.setFieldValue("originalKey", song.original_key);
		form.setFieldValue("spKey", song.sp_key ?? "");
		form.setFieldValue(
			"selectedArtists",
			song.artist.map((a) => ({ id: a.id, label: a.name, isNew: false })),
		);
		form.setFieldValue("selectedTagIds", song.tags?.map((t) => t.id) ?? []);
	}, [form, song]);

	const loadingComponent = (
		<ThemedView style={{ flex: 1 }}>
			<ActivityIndicator size="large" color={colors.text} />
		</ThemedView>
	);

	return (
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior={Platform.OS === "ios" ? "padding" : undefined}>
			<ScrollView
				style={{ flex: 1 }}
				contentContainerStyle={{ padding: 8 }}
				keyboardShouldPersistTaps="handled">
				{isSongLoading ? (
					loadingComponent
				) : (
					<ThemedView style={{ justifyContent: "space-between", flex: 1 }}>
						<ThemedView>
							<ThemedText>Title</ThemedText>
							<Field form={form} name="title">
								{(field) => (
									<TextInput
										style={[styles.input, { color: colors.text, borderColor: colors.text }]}
										value={field.state.value}
										onChangeText={(text) => { field.handleChange(text); markDirty(); }}
										placeholder="Enter title"
										placeholderTextColor={colors.placeholder}
									/>
								)}
							</Field>

							<ThemedText>Artist</ThemedText>
							<Field form={form} name="selectedArtists">
								{(field) =>
									isArtistsLoading ? loadingComponent : (
										<AutocompleteInput
											value={field.state.value}
											onChange={(val) => { field.setValue(val); markDirty(); }}
											data={availableArtists?.map((item) => ({ ...item, label: item.name, isNew: false })) ?? []}
											placeholder="Select artist"
										/>
									)
								}
							</Field>

							<ThemedView style={{ flexDirection: "row", gap: 12 }}>
								<ThemedView style={{ flex: 1 }}>
									<ThemedText>Duration (seconds)</ThemedText>
									<Field form={form} name="duration">
										{(field) => (
											<TextInput
												style={[styles.input, { borderColor: colors.tint, color: colors.text }]}
												value={field.state.value > 0 ? String(field.state.value) : ""}
												onChangeText={(text) => {
													const numericValue = parseInt(text, 10);
													field.setValue(!isNaN(numericValue) ? numericValue : 0);
													markDirty();
												}}
												keyboardType="numeric"
												placeholder="Enter duration"
												placeholderTextColor={colors.placeholder}
											/>
										)}
									</Field>
								</ThemedView>

								<ThemedView style={{ flex: 1 }}>
									<ThemedText>BPM</ThemedText>
									<Field form={form} name="bpm">
										{(field) => (
											<TextInput
												style={[styles.input, { borderColor: colors.tint, color: colors.text }]}
												value={field.state.value > 0 ? String(field.state.value) : ""}
												onChangeText={(text) => {
													const numericValue = parseInt(text, 10);
													field.setValue(!isNaN(numericValue) ? numericValue : 0);
													markDirty();
												}}
												keyboardType="numeric"
												placeholder="Enter BPM"
												placeholderTextColor={colors.placeholder}
											/>
										)}
									</Field>
								</ThemedView>
							</ThemedView>

							<ThemedView style={styles.keysRow}>
								<Field form={form} name="originalKey">
									{(field) => (
										<KeyPicker
											open={ogKeyOpen}
											setOpen={(val) => {
												if (val) setSPKeyOpen(false);
												setOGKeyOpen(val);
												Keyboard.dismiss();
											}}
											label="Original Key"
											value={field.state.value}
											onChange={(val) => {
												field.setValue(val);
												if (val === form.getFieldValue("spKey"))
													form.setFieldValue("spKey", "");
												markDirty();
												Keyboard.dismiss();
											}}
											zIndex={5000}
											zIndexInverse={1000}
										/>
									)}
								</Field>

								<Field form={form} name="spKey">
									{(field) => (
										<KeyPicker
											open={spKeyOpen}
											setOpen={(val) => {
												if (val) setOGKeyOpen(false);
												setSPKeyOpen(val);
												Keyboard.dismiss();
											}}
											label="New Key (optional)"
											value={field.state.value}
											onChange={(val) => {
												field.setValue(val === "none" ? "" : val);
												markDirty();
												Keyboard.dismiss();
											}}
											removeKey={form.getFieldValue("originalKey")}
											extraOptions={[
												{
													label: "None",
													value: "none",
													containerStyle: { backgroundColor: colors.background },
													labelStyle: { color: colors.text },
												},
											]}
											zIndex={4000}
											zIndexInverse={2000}
										/>
									)}
								</Field>
							</ThemedView>

							<ThemedText>Lyrics</ThemedText>
							<Field form={form} name="lyrics">
								{(field) => (
									<TextInput
										style={[styles.input, { height: 120, borderColor: colors.tint, color: colors.text }]}
										value={field.state.value}
										onChangeText={(text) => { field.handleChange(text); markDirty(); }}
										multiline
									/>
								)}
							</Field>

							<ThemedText>Tags</ThemedText>
							<Field form={form} name="selectedTagIds">
								{(field) =>
									isTagsLoading ? loadingComponent : (
										<ThemedView style={[styles.tagsContainer, { backgroundColor: colors.background }]}>
											{tags?.map((tag) => (
												<TouchableOpacity
													key={tag.id}
													style={[
														styles.tagCheckbox,
														field.state.value.includes(tag.id) && { backgroundColor: tag.color || "#00F" },
													]}
													onPress={() => {
														field.setValue((prev: string[]) =>
															prev.includes(tag.id)
																? prev.filter((id) => id !== tag.id)
																: [...prev, tag.id],
														);
														markDirty();
													}}>
													<ThemedText style={{ color: field.state.value.includes(tag.id) ? "#FFF" : "#999" }}>
														{tag.name}
													</ThemedText>
												</TouchableOpacity>
											))}
										</ThemedView>
									)
								}
							</Field>
						</ThemedView>

						<TouchableOpacity
							style={styles.saveButton}
							onPress={() => form.handleSubmit()}
							disabled={loading}>
							<ThemedText style={{ color: colors.text, textAlign: "center" }}>
								{loading ? "Saving..." : "Save"}
							</ThemedText>
						</TouchableOpacity>
					</ThemedView>
				)}
			</ScrollView>

			<ConfirmModal
				visible={isModalVisible}
				title="Unsaved changes"
				message="You have unsaved changes. Are you sure you want to discard them?"
				confirmLabel="Discard"
				cancelLabel="Keep editing"
				destructive
				onConfirm={handleConfirm}
				onCancel={handleCancel}
			/>
		</KeyboardAvoidingView>
	);
}