import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	Switch,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import DraggableFlatList, {
	RenderItemParams,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

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
import AvailableSongsModal from "./AvailableSongsModal";

export default function EditShowScreen() {
	const colors = useColors();
	const { id } = useLocalSearchParams();
	const showId = getSingleParam(id);
	const router = useRouter();

	const upsertShow = useUpsertShow();
	const { data: show, isLoading } = useShow(showId || "");
	const { data: availableSongs } = useSongs();

	const form = useForm({
		defaultValues: {
			title: "",
			date: "",
			time: "",
			draft: false,
			parts: 1,
			soundcheck: false,
			soundcheckTime: "",
			paid: false,
			amount: 0,
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
					},
				});
				showSuccessToast("Show successfully saved!");
				router.back();
			} catch (error: any) {
				showErrorToast(error.message);
			} finally {
				setLoading(false);
			}
		},
	});

	const navigation = useNavigation();
	const [loading, setLoading] = useState(false);

	useLayoutEffect(() => {
		navigation.setOptions({
			title: showId ? "Edit Show" : "Add New Show",
		});
	}, [id, navigation, showId]);

	const [songsByPart, setSongsByPart] = useState<Part[]>([
		{ partNumber: 1, songs: [] },
	]);
	const [availableSongsModalContent, setAvailableSongsModalContent] =
		useState<any>(null);

	useEffect(() => {
		if (!show) return;
		form.setFieldValue("title", show.title);
		form.setFieldValue("draft", show.draft);
		form.setFieldValue("parts", show.parts ?? 1);
		form.setFieldValue("date", new Date(show.date).toLocaleDateString("en-GB"));

		const groupedParts: Part[] = Array.from({ length: show.parts }, (_, i) => ({
			partNumber: i + 1,
			songs: [],
		}));
		setSongsByPart(groupedParts);
	}, [form, show]);

	const renderSongItem = ({
		item,
		getIndex,
		drag,
		isActive,
	}: RenderItemParams<Song>) => {
		const artistName = item.artist.map((ar) => ar.name).join(", ");
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

	const FormHeader = () => {
		return (
			<>
				<ThemedView style={{ display: "flex", flexDirection: "row", gap: 6 }}>
					<ThemedView style={{ flex: 1 }}>
						<ThemedText>Title</ThemedText>
						<Field
							form={form}
							name="title">
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
					</ThemedView>

					<ThemedView
						style={{
							flexDirection: "column",
							alignItems: "center",
							flex: 0.3,
						}}>
						<ThemedText>Draft</ThemedText>
						<Field
							form={form}
							name="draft">
							{(field) => (
								<Switch
									value={field.state.value}
									onValueChange={field.handleChange}
									thumbColor={field.state.value ? colors.accent : "#fff"}
									trackColor={{ false: "#ccc", true: "#DA291C80" }}
								/>
							)}
						</Field>
					</ThemedView>
				</ThemedView>

				<ThemedView style={{ display: "flex", gap: 12, flexDirection: "row" }}>
					<ThemedView style={{ flex: 1 }}>
						<ThemedText>Date</ThemedText>
						<Field
							form={form}
							name="date">
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
					</ThemedView>

					<ThemedView style={{ flex: 1 }}>
						<ThemedText>Time</ThemedText>
						<Field
							form={form}
							name="time">
							{(field) => (
								<TextInput
									style={[styles.input, { color: colors.text }]}
									value={field.state.value}
									onChangeText={field.handleChange}
									placeholder="00:00"
									placeholderTextColor={colors.placeholder}
								/>
							)}
						</Field>
					</ThemedView>
				</ThemedView>

				<ThemedView>
					<ThemedView
						style={{
							flexDirection: "row",
							alignItems: "center",
						}}>
						<ThemedText>Soundcheck</ThemedText>
						<Field
							form={form}
							name="soundcheck">
							{(field) => (
								<Switch
									value={field.state.value}
									onValueChange={field.handleChange}
									thumbColor={field.state.value ? colors.accent : "#fff"}
									trackColor={{ false: "#ccc", true: "#DA291C80" }}
								/>
							)}
						</Field>
					</ThemedView>
				</ThemedView>

				<form.Subscribe selector={(state) => state.values.soundcheck}>
					{(soundcheck) => {
						if (!soundcheck) return;
						return (
							<ThemedView>
								<ThemedText>Soundcheck Time</ThemedText>
								<Field
									form={form}
									name="soundcheckTime">
									{(field) => (
										<TextInput
											style={[styles.input, { color: colors.text }]}
											value={field.state.value}
											onChangeText={field.handleChange}
											placeholder="00:00"
											placeholderTextColor={colors.placeholder}
										/>
									)}
								</Field>
							</ThemedView>
						);
					}}
				</form.Subscribe>

				<ThemedView
					style={{
						flexDirection: "row",
						justifyContent: "space-between",
						marginBottom: 16,
					}}>
					{[1, 2, 3].map((p, index) => {
						const isSelected = form.getFieldValue("parts") === p;
						return (
							<TouchableOpacity
								key={index}
								style={[
									styles.partSegment,
									isSelected && { backgroundColor: "#da291cbf" },
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
								<ThemedText
									style={[
										styles.partSegmentText,
										{ color: isSelected ? colors.text : "#FFF" },
									]}>
									{p} Part{p > 1 && "s"}
								</ThemedText>
							</TouchableOpacity>
						);
					})}
				</ThemedView>
			</>
		);
	};

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}>
				<ThemedView style={{ flex: 1 }}>
					<FlatList
						data={songsByPart}
						keyExtractor={(item) => item.partNumber.toString()}
						ListHeaderComponent={<FormHeader />}
						renderItem={({ item: part, index: i }) => (
							<ThemedView
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
										<ThemedView style={{ padding: 8, marginBottom: 8 }}>
											<ThemedText style={{ fontWeight: "bold" }}>
												{getTotalPartTime(part.songs)}
											</ThemedText>
										</ThemedView>
									)}
								</ThemedView>

								<View style={{ maxHeight: 200 }}>
									<DraggableFlatList
										data={part.songs}
										onDragEnd={({ data }) => {
											const updated = [...songsByPart];
											updated[i].songs = data;
											setSongsByPart(updated);
										}}
										keyExtractor={(item) => item.id}
										renderItem={renderSongItem}
										nestedScrollEnabled
										contentContainerStyle={{ padding: 8 }}
										ListEmptyComponent={
											<TouchableOpacity
												onPress={() =>
													setAvailableSongsModalContent({
														availableSongs,
														partNumber: part.partNumber,
													})
												}
												style={{
													flexDirection: "row",
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
								</View>
							</ThemedView>
						)}
					/>

					{/* Sticky Save Button */}
					<SafeAreaView
						edges={["bottom"]}
						style={{ backgroundColor: colors.background }}>
						<View
							style={{
								padding: 16,
								borderTopWidth: 1,
								borderTopColor: "#ccc",
							}}>
							<TouchableOpacity
								style={{
									backgroundColor: "#DA291C",
									paddingVertical: 12,
									borderRadius: 6,
									alignItems: "center",
								}}
								onPress={() => form.handleSubmit()}
								disabled={loading}>
								<ThemedText style={{ color: colors.text }}>
									{loading ? "Saving..." : "Save"}
								</ThemedText>
							</TouchableOpacity>
						</View>
					</SafeAreaView>

					{/* AvailableSongsModal */}
					<AvailableSongsModal
						content={availableSongsModalContent}
						setContent={setAvailableSongsModalContent}
						onConfirm={(partNumber: number, selectedSongs: Song[]) => {
							setSongsByPart((prevParts) => {
								const updated = [...prevParts];
								const index = updated.findIndex(
									(p) => p.partNumber === partNumber
								);
								if (index !== -1) {
									updated[index] = { ...updated[index], songs: selectedSongs };
								} else {
									updated.push({ partNumber, songs: selectedSongs });
								}
								return updated;
							});
							setAvailableSongsModalContent(null);
						}}
					/>
				</ThemedView>
			</KeyboardAvoidingView>
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
