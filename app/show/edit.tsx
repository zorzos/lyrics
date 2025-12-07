import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import {
	ActivityIndicator,
	StyleSheet,
	Switch,
	Text,
	TextInput,
	TouchableOpacity,
} from "react-native";
import DraggableFlatList, {
	RenderItemParams,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Part, Song } from "@/types";

import { useColors } from "@/hooks/use-colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { useShow, useUpsertShow } from "@/hooks/useShows";
import { useSongs } from "@/hooks/useSongs";
import { getTotalPartTime } from "@/utils/dateUtils";
import { getSingleParam, validate } from "@/utils/paramUtils";
import { showErrorToast, showSuccessToast } from "@/utils/toastUtils";
import { Field, useForm } from "@tanstack/react-form";

export default function EditShowScreen() {
	const colors = useColors();
	const { id } = useLocalSearchParams();
	const showId = getSingleParam(id);
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	const form = useForm({
		defaultValues: {
			title: "",
			date: "",
			draft: false,
			parts: 1,
		},
		validators: {
			onSubmit: validate,
		},
		onSubmit: async ({ value }) => {
			try {
				setLoading(true);
				await upsertShow.mutateAsync({
					id: showId,
					payload: {
						title: value.title,
						date: new Date(value.date),
						draft: value.draft,
						parts: value.parts,
					}
				});

				showSuccessToast("Show successfully saved!");
				router.back();
			} catch (error: any) {
				showErrorToast(error.message);
			} finally {
				setLoading(false);
			}
		}
	});

	const navigation = useNavigation();
	useLayoutEffect(() => {
		navigation.setOptions({
			title: showId ? "Edit Show" : "Add New Show",
		});
	}, [id, navigation]);

	const [songsByPart, setSongsByPart] = useState<Part[]>([
		{
			partNumber: 1,
			songs: [{
				id: '1',
				title: 'Kostis',
				lyrics: "",
				original_key: "A",
				duration: 123,
				bpm: 321,
				artist: [
					{ id: '28', name: 'Some Artist' },
					{ id: '29', name: 'Another Artist' }
				],
			}, {
				id: '2',
				title: 'Kostis II',
				lyrics: "",
				original_key: "A",
				duration: 220,
				bpm: 321,
				artist: [
					{ id: '32', name: 'New Artist' },
				],
			}],
		},
	]);

	const {
		data: show,
		isLoading
	} = useShow(showId || "");
	const { data: availableSongs } = useSongs();
	const upsertShow = useUpsertShow();
	// console.log("AVAILABLE SONGS", availableSongs?.length);

	const [availableSongsModalContent, setAvailableSongsModalContent] =
		useState<any>([]);

	useEffect(() => {
		if (!show) return;
		form.setFieldValue("title", show.title);
		form.setFieldValue("draft", show.draft);
		form.setFieldValue("parts", show.parts ?? 1);
		form.setFieldValue("date", new Date(show.date).toLocaleDateString('en-GB'));

		const groupedParts: Part[] = Array.from(
			{ length: show.parts },
			(_, i) => ({ partNumber: i + 1, songs: [] })
		);

		setSongsByPart(groupedParts);
	}, [show]);

	const renderSongItem = ({ item, getIndex, drag, isActive }: RenderItemParams<Song>) => {
		const artistName = item.artist.map(ar => ar.name).join(', ');
		return (
			<TouchableOpacity
				style={{
					padding: 10,
					backgroundColor: isActive ? "#ddd" : colors.background,
					marginBottom: 4,
					borderRadius: 6,
					borderWidth: 1,
					borderColor: "#ccc",
				}}
				onLongPress={drag}>
				<ThemedText>
					#{(getIndex() ?? 0) + 1} {item.title} ({artistName})
				</ThemedText>
			</TouchableOpacity>
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

	return (
		<GestureHandlerRootView style={{ flex: 1, paddingBottom: 16 }}>
			<ThemedView style={{ flex: 1, padding: 16 }}>
				<ThemedText>Title</ThemedText>
				<Field form={form} name="title">
					{(field) => (
						<TextInput
							style={[styles.input, { color: colors.text }]}
							value={field.state.value}
							onChangeText={field.handleChange}
							placeholder="Enter title"
							placeholderTextColor={colors.placeholder}
						/>
					)}
				</Field>


				<ThemedText>Date</ThemedText>
				<Field form={form} name="date">
					{(field) => (
						<TextInput
							style={[styles.input, { color: colors.text }]}
							value={field.state.value}
							onChangeText={field.handleChange}
							placeholder="DD-MM-YYYY"
							placeholderTextColor={colors.placeholder}
						/>
					)}
				</Field>


				<ThemedView
					style={{
						flexDirection: "row",
						alignItems: "center",
						marginVertical: 8,
					}}>
					<ThemedText>Draft</ThemedText>
					<Field form={form} name="draft">
						{(field) => (
							<Switch
								value={field.state.value}
								onValueChange={field.handleChange}
								thumbColor={form.getFieldValue("draft") ? colors.accent : "#fff"}
								trackColor={{ false: "#ccc", true: "#DA291C80" }}
							/>
						)}
					</Field>
				</ThemedView>

				<ThemedView
					style={{
						flexDirection: "row",
						justifyContent: "space-between",
						marginBottom: 16,
					}}>
					{[1, 2, 3].map((p, index, availableParts) => {
						const isSelected = form.getFieldValue("parts") === p;
						return (
							<TouchableOpacity
								key={index}
								style={[
									styles.partSegment,
									isSelected && {
										backgroundColor: "#da291cbf",
									},
									{
										borderRadius: 8,
										borderColor: isSelected ? "#da291cbf" : colors.text,
									},
								]}
								onPress={() => {
									form.setFieldValue("parts", p);
									setSongsByPart((prev) => {
										if (prev.length === p) return prev;
										if (prev.length < p) {
											const newParts = Array.from(
												{ length: p - prev.length },
												(_, i) => ({
													partNumber: prev.length + i + 1,
													songs: [],
												})
											);
											return [...prev, ...newParts];
										} else {
											return prev.slice(0, p);
										}
									});
								}}>
								<Text
									style={[
										styles.partSegmentText,
										{ color: isSelected ? colors.text : "#FFF" },
									]}>
									{p} Part{p > 1 && "s"}
								</Text>
							</TouchableOpacity>
						);
					})}
				</ThemedView>

				{songsByPart.map((part, i) => (
					<ThemedView
						key={part.partNumber}
						style={{
							marginBottom: 16,
							borderWidth: 1,
							borderColor: "#ccc",
							borderRadius: 8,
							overflow: "hidden",
						}}>
						<ThemedView
							style={{
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "space-between",
							}}>
							<ThemedView
								style={{
									flexDirection: "row",
									padding: 8,
									backgroundColor: colors.background,
									gap: 4,
									alignItems: "center",
									marginBottom: 8,
								}}>
								<ThemedText style={{ fontWeight: "bold" }}>
									Part {part.partNumber}
								</ThemedText>
								{part.songs.length > 0 && (
									<TouchableOpacity
										onPress={() =>
											console.log(`Editing Part ${part.partNumber}`)
										}>
										<MaterialIcons
											name="edit"
											size={20}
											color={colors.text}
										/>
									</TouchableOpacity>
								)}
							</ThemedView>
							{part.songs.length > 0 && (
								<ThemedView
									style={{
										padding: 8,
										marginBottom: 8,
									}}>
									<ThemedText style={{ fontWeight: "bold" }}>
										{getTotalPartTime(part.songs)}
									</ThemedText>
								</ThemedView>
							)}
						</ThemedView>

						<DraggableFlatList
							data={part.songs}
							onDragEnd={({ data }) => {
								setSongsByPart((prev) => {
									const updated = [...prev];
									updated[i].songs = data;
									return updated;
								});
							}}
							contentContainerStyle={{
								padding: 8,
							}}
							keyExtractor={(item) => item.id}
							renderItem={renderSongItem}
							ListEmptyComponent={
								<TouchableOpacity
									onPress={() => {
										setAvailableSongsModalContent({
											availableSongs,
											partNumber: part.partNumber,
										});
									}}
									style={{
										flexDirection: "row",
										alignContent: "center",
										justifyContent: "center",
										padding: 16,
										borderRadius: 8,
										margin: 4,
										backgroundColor: "#da291c33",
										gap: 4,
									}}>
									<ThemedText>Tap here to add songs</ThemedText>
									<MaterialIcons
										name="add-circle-outline"
										size={24}
										color={colors.text}
									/>
								</TouchableOpacity>
							}
						/>
					</ThemedView>
				))}

				<TouchableOpacity
					style={styles.saveButton}
					onPress={() => form.handleSubmit()}
					disabled={loading}>
					<ThemedText style={{ color: "#fff", textAlign: "center" }}>
						{loading ? "Saving..." : "Save"}
					</ThemedText>
				</TouchableOpacity>
			</ThemedView>
			{/* <AvailableSongsModal
				content={availableSongsModalContent}
				setContent={setAvailableSongsModalContent}
				onConfirm={(partNumber: number, selectedSongs: Song[]) => {
					// Update songsByPart
					setSongsByPart((prevParts) => {
						const updated = [...prevParts];
						const index = updated.findIndex((p) => p.partNumber === partNumber);

						if (index !== -1) {
							updated[index] = { ...updated[index], songs: selectedSongs };
						} else {
							updated.push({ partNumber, songs: selectedSongs });
						}
						return updated;
					});

					setAvailableSongs((prevAvailable) =>
						prevAvailable.filter(
							(song) => !selectedSongs.some((sel: Song) => sel.id === song.id)
						)
					);

					setAvailableSongsModalContent(false);
				}}
			/> */}
		</GestureHandlerRootView>
	);
}

const styles = StyleSheet.create({
	input: {
		borderWidth: 1,
		borderColor: "#999",
		borderRadius: 6,
		padding: 8,
		marginBottom: 12,
	},
	saveButton: {
		backgroundColor: "#DA291C",
		paddingVertical: 12,
		borderRadius: 6,
		marginTop: 16,
	},
	partsSelectorContainer: {
		flexDirection: "row",
		borderRadius: 8,
		overflow: "hidden",
		marginBottom: 16,
	},
	partSegment: {
		flex: 1,
		paddingVertical: 10,
		alignItems: "center",
	},
	partSegmentText: {
		fontSize: 14,
		fontWeight: "500",
	},
});
