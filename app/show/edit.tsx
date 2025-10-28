import { useTheme } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import {
	ActivityIndicator,
	Modal,
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
import { getSongs } from "@/lib/queries/songs";
import { supabase } from "@/lib/supabase";
import { Show, Song } from "@/types";

import { getTotalPartTime } from "@/utils/dateUtils";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Toast from "react-native-toast-message";

export default function EditShowScreen() {
	const { colors } = useTheme();
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

	const [songsByPart, setSongsByPart] = useState<Song[][]>(Array(parts).fill([]));
	const [availableSongs, setAvailableSongs] = useState<Song[]>([]);

	const [songsModalVisible, setSongsModalVisible] = useState(false);
	const [activePart, setActivePart] = useState<number | null>(null);

	useEffect(() => {
		async function fetchSongs() {
			const songs = await getSongs();
			setAvailableSongs(songs);
		}
		fetchSongs();
	}, []);

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

					// Map songs into parts
					const groupedSongs: Song[][] = Array.from(
						{ length: data.parts },
						() => []
					);
					(data.show_songs ?? []).forEach((ss: any) => {
						const partIndex = ss.order ? ss.order - 1 : 0;
						groupedSongs[partIndex].push(ss.songs);
					});
					setSongsByPart(groupedSongs);
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

				// Remove all show_songs
				await supabase.from("show_songs").delete().eq("show_id", id);

				// Insert songs per part
				for (let partIndex = 0; partIndex < songsByPart.length; partIndex++) {
					const partSongs = songsByPart[partIndex];
					const inserts = partSongs.map((song, idx) => ({
						show_id: id,
						song_id: song.id,
						order: partIndex + 1,
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

				for (let partIndex = 0; partIndex < songsByPart.length; partIndex++) {
					const partSongs = songsByPart[partIndex];
					const inserts = partSongs.map((song, idx) => ({
						show_id: showId,
						song_id: song.id,
						order: partIndex + 1,
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
					padding: 12,
					backgroundColor: isActive ? "#ddd" : "#fff",
					marginBottom: 4,
					borderRadius: 6,
					borderWidth: 1,
					borderColor: "#ccc",
				}}
				onLongPress={drag}>
				<Text>{item.title}</Text>
			</TouchableOpacity>
		);
	};

	if (fetchingShow) {
		return (
			<ThemedView
				style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator
					size="large"
					color={colors.primary}
				/>
			</ThemedView>
		);
	}

	// console.log("AVAILABLE SONGS", availableSongs[1]);

	return (
		<GestureHandlerRootView style={{ flex: 1, paddingBottom: 16 }}>
			<ThemedView style={{ flex: 1, padding: 16 }}>
				<ThemedText>Title</ThemedText>
				<TextInput
					style={[styles.input, { color: colors.text }]}
					value={title}
					onChangeText={setTitle}
				/>

				<ThemedText>Date</ThemedText>
				<TextInput
					style={[styles.input, { color: colors.text }]}
					value={date}
					onChangeText={setDate}
					placeholder="DD-MM-YYYY"
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
						thumbColor={draft ? colors.primary : "#fff"}
						trackColor={{ false: "#ccc", true: colors.primary + "55" }}
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
									isSelected && { backgroundColor: colors.primary },
									!isSelected && { borderColor: colors.text, borderWidth: 1 },
									p === availableParts[0] && {
										borderTopLeftRadius: 8,
										borderBottomLeftRadius: 8,
									},
									p === availableParts[availableParts.length - 1] && {
										borderTopRightRadius: 8,
										borderBottomRightRadius: 8,
									},
								]}
								onPress={() => {
									setParts(p);
									if (songsByPart.length < p) {
										setSongsByPart((prev) => [
											...prev,
											...Array.from({ length: p - prev.length }, () => []),
										]);
									}
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
				{Array.from({ length: parts }, (_, i) => (
					<ThemedView
						key={i}
						style={{
							marginBottom: 16,
							borderWidth: 1,
							borderColor: "#ccc",
							borderRadius: 8,
							overflow: "hidden",
						}}>
						<ThemedView
							style={{
								backgroundColor: colors.background,
								flexDirection: 'row',
								alignItems: 'center',
								justifyContent: 'space-between',
								padding: 8
							}}
						>
							<ThemedView
								style={{
									flexDirection: "row",
									backgroundColor: colors.background,
									gap: 4,
									alignItems: "center",
									margin: 4
								}}>
								<ThemedText style={{ fontWeight: "bold" }}>
									Part {i + 1}
								</ThemedText>
								{/* {songsByPart[i].length > 0 && ( */}
								<TouchableOpacity
									onPress={() => console.log(`Editing Part ${i + 1}`)}>
									<MaterialIcons
										name="edit"
										size={20}
										color={colors.text}
									/>
								</TouchableOpacity>
								{/* )} */}
							</ThemedView>
							{/* {songsByPart[i].length > 0 && ( */}
							<ThemedText
								style={{ fontSize: 14 }}>
								{getTotalPartTime(songsByPart[i])}
							</ThemedText>
							{/* )} */}
						</ThemedView>

						<DraggableFlatList
							data={songsByPart[i]}
							onDragEnd={({ data }) => {
								setSongsByPart((prev) => {
									const updated = [...prev];
									updated[i] = data;
									return updated;
								});
							}}
							keyExtractor={(item) => item.id}
							renderItem={renderSongItem}
							ListEmptyComponent={
								<TouchableOpacity
									onPress={() => {
										setActivePart(i);
										setSongsModalVisible(true);
										console.log(`ADDING SONGS TO PART ${i + 1}`)
									}}
									style={{
										flexDirection: "row",
										alignItems: "center",
										justifyContent: "center",
										padding: 16,

										borderWidth: 1,
										borderColor: "red",
										borderRadius: 8,
										margin: 4, // <--- TODO
									}}>
									<ThemedText>Tap here to add songs</ThemedText>
									<MaterialIcons
										name="add-circle-outline"
										size={24}
										color="white"
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
				<Modal
					visible={songsModalVisible}
					animationType="slide"
					transparent={true}
					onRequestClose={() => setSongsModalVisible(false)}
					style={{
						flex: 1,
					}}
				>
					<ThemedView
						style={{
							flex: 1,
							backgroundColor: "rgba(0,0,0,0.5)",
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						<ThemedView
							style={{
								backgroundColor: colors.card,
								borderRadius: 12,
								padding: 20,
								width: "80%",
								alignItems: "center",
							}}
						>
							<ThemedText style={{ marginBottom: 16, fontWeight: "bold" }}>
								Add songs to Part {activePart !== null ? activePart + 1 : ""}
							</ThemedText>

							<TouchableOpacity
								style={{
									backgroundColor: colors.primary,
									paddingVertical: 10,
									paddingHorizontal: 20,
									borderRadius: 8,
								}}
								onPress={() => setSongsModalVisible(false)}
							>
								<ThemedText style={{ color: "#fff" }}>Close</ThemedText>
							</TouchableOpacity>
						</ThemedView>
					</ThemedView>
				</Modal>
			</ThemedView>
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
		backgroundColor: "#007AFF",
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
		// color: "#333",
		fontWeight: "500",
	},
});
