import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import {
	ActivityIndicator,
	StyleSheet,
	Switch,
	Text,
	TextInput,
	TouchableOpacity
} from "react-native";
import DraggableFlatList, {
	RenderItemParams,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getSongs } from "@/lib/queries/songs";
import { supabase } from "@/lib/supabase";
import { Part, Show, Song } from "@/types";

import { useColors } from "@/hooks/use-colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Toast from "react-native-toast-message";

import { getTotalPartTime } from "@/utils/dateUtils";
import AvailableSongsModal from "./AvailableSongsModal";

export default function EditShowScreen() {
	const colors = useColors();
	const queryClient = useQueryClient();
	const { id } = useLocalSearchParams();
	const router = useRouter();

	const [loading, setLoading] = useState(false);
	const [fetchingShow, setFetchingShow] = useState(false);

	const [title, setTitle] = useState("");
	const [date, setDate] = useState("");
	const [draft, setDraft] = useState(false);
	const [parts, setParts] = useState(1);

	const navigation = useNavigation();
	useLayoutEffect(() => {
		navigation.setOptions({
			title: id ? "Edit Show" : "Add New Show",
		});
	}, [id, navigation]);

	const [songsByPart, setSongsByPart] = useState<Part[]>([{
		partNumber: 1, songs: []
	}]);
	const [availableSongs, setAvailableSongs] = useState<Song[]>([]);
	console.log('AVAILABLE SONGS', availableSongs.length);

	const [
		availableSongsModalContent,
		setAvailableSongsModalContent
	] = useState<any>(undefined);

	useEffect(() => {
		async function fetchSongs() {
			const songsByParts = await getSongs();
			const allSongs: Song[] = songsByParts.parts.flatMap((part) => part.songs);
			setAvailableSongs(allSongs);
		}
		fetchSongs();
	}, []);

	// Fetch show if editing
	useEffect(() => {
		async function fetchShow() {
			if (!id) return;
			setFetchingShow(true);
			try {
				const { data, error } = await supabase
					.from("shows")
					.select(
						`
						id, title, date, draft, parts,
						show_songs(order, songs(id, title, artist, duration))
					`
					)
					.eq("id", id)
					.single();

				if (error) throw error;
				if (data) {
					setTitle(data.title);
					setDate(data.date);
					setDraft(data.draft ?? false);
					setParts(data.parts ?? 1);

					const groupedParts: Part[] = Array.from(
						{ length: data.parts },
						(_, i) => ({ partNumber: i + 1, songs: [] })
					);

					(data.show_songs ?? []).forEach((ss: any) => {
						const index = ss.order ? ss.order - 1 : 0;
						groupedParts[index].songs.push(ss.songs);
					});

					setSongsByPart(groupedParts);
				}
			} catch (e) {
				console.error(e);
			} finally {
				setFetchingShow(false);
			}
		}
		fetchShow();
	}, [id]);

	const handleSave = async () => {
		setLoading(true);
		try {
			const payload: Partial<Show> = {
				title,
				date: new Date(date),
				draft,
				parts,
			};

			if (id) {
				const { error } = await supabase
					.from("shows")
					.update(payload)
					.eq("id", id);
				if (error) throw error;

				await supabase.from("show_songs").delete().eq("show_id", id);

				for (const part of songsByPart) {
					const inserts = part.songs.map((song, idx) => ({
						show_id: id,
						song_id: song.id,
						order: part.partNumber,
						song_order: idx + 1,
					}));
					if (inserts.length > 0)
						await supabase.from("show_songs").insert(inserts);
				}

				queryClient.invalidateQueries({ queryKey: ["shows"] });
			} else {
				const { data, error } = await supabase
					.from("shows")
					.insert(payload)
					.select("id")
					.single();
				if (error) throw error;
				const showId = data?.id;

				for (const part of songsByPart) {
					const inserts = part.songs.map((song, idx) => ({
						show_id: showId,
						song_id: song.id,
						order: part.partNumber,
						song_order: idx + 1,
					}));
					if (inserts.length > 0)
						await supabase.from("show_songs").insert(inserts);
				}

				queryClient.invalidateQueries({ queryKey: ["shows"] });
			}

			Toast.show({ type: "success", text1: "Show saved!" });
			router.back();
		} catch (e: any) {
			console.error(e);
			Toast.show({ type: "error", text1: e.message || "Failed to save show" });
		} finally {
			setLoading(false);
		}
	};

	const renderSongItem = ({ item, drag, isActive }: RenderItemParams<Song>) => {
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
				<ThemedText>#1 {item.title} ({item.artist})</ThemedText>
			</TouchableOpacity>
		);
	};

	if (fetchingShow) {
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
				<TextInput
					style={[styles.input, { color: colors.text }]}
					value={title}
					onChangeText={setTitle}
					placeholder="Enter title"
					placeholderTextColor={colors.placeholder}
				/>

				<ThemedText>Date</ThemedText>
				<TextInput
					style={[styles.input, { color: colors.text }]}
					value={date}
					onChangeText={setDate}
					placeholder="DD-MM-YYYY"
					placeholderTextColor={colors.placeholder}
				/>

				<ThemedView
					style={{
						flexDirection: "row",
						alignItems: "center",
						marginVertical: 8,
					}}>
					<ThemedText>Draft</ThemedText>
					<Switch
						value={draft}
						onValueChange={setDraft}
						thumbColor={draft ? colors.accent : "#fff"}
						trackColor={{ false: "#ccc", true: "#DA291C80" }}
					/>
				</ThemedView>

				<ThemedView
					style={{
						flexDirection: "row",
						justifyContent: "space-between",
						marginBottom: 16,
					}}>
					{[1, 2, 3].map((p, index, availableParts) => {
						const isSelected = parts === p;
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
									}
								]}
								onPress={() => {
									setParts(p);
									setSongsByPart((prev) => {
										if (prev.length === p) return prev;
										if (prev.length < p) {
											const newParts = Array.from({ length: p - prev.length }, (_, i) => ({
												partNumber: prev.length + i + 1,
												songs: [],
											}));
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
									{p} Part{p > 1 ? "s" : ""}
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
								flexDirection: 'row',
								alignItems: 'center',
								justifyContent: 'space-between'
							}}
						>
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
									<ThemedText style={{ fontWeight: 'bold' }}>{getTotalPartTime(part.songs)}</ThemedText>
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
								padding: 8
							}}
							keyExtractor={(item) => item.id}
							renderItem={renderSongItem}
							ListEmptyComponent={
								<TouchableOpacity
									onPress={() => {
										setAvailableSongsModalContent({
											availableSongs,
											partNumber: part.partNumber
										});
									}}
									style={{
										flexDirection: "row",
										alignContent: "center",
										justifyContent: "center",
										padding: 16,
										borderRadius: 8,
										margin: 4,
										backgroundColor: '#da291c33',
										gap: 4
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
					onPress={handleSave}
					disabled={loading}>
					<ThemedText style={{ color: "#fff", textAlign: "center" }}>
						{loading ? "Saving..." : "Save"}
					</ThemedText>
				</TouchableOpacity>
			</ThemedView>
			<AvailableSongsModal
				content={availableSongsModalContent}
				setContent={setAvailableSongsModalContent}
				onConfirm={(partNumber: number, selectedSongs: Song[]) => {
					// Update songsByPart
					setSongsByPart((prevParts) => {
						const updated = [...prevParts];
						const index = updated.findIndex(p => p.partNumber === partNumber);

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
			/>
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
