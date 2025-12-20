import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColors } from "@/hooks/use-colors";
import { AvailableSongsModalProps, Song } from "@/types";
import { useState } from "react";
import { FlatList, Modal, Pressable, TouchableOpacity } from "react-native";

export default function AvailableSongsModal({
	content,
	setContent,
	onConfirm,
}: AvailableSongsModalProps) {
	const colors = useColors();
	const [selectedSongs, setSelectedSongs] = useState<Song[]>([]);

	const toggleSong = (song: Song) => {
		const isSelected = selectedSongs.some((s) => s.id === song.id);
		if (isSelected) {
			setSelectedSongs((prev) => prev.filter((s) => s.id !== song.id));
		} else {
			setSelectedSongs((prev) => [...prev, song]);
		}
	};

	const getOrderNumber = (songId: string) => {
		const index = selectedSongs.findIndex((s) => s.id === songId);
		return index !== -1 ? `#${index + 1}` : "";
	};

	const constructArtistName = (artists: any[]) => {
		if (!artists.length) return "TEST DATA? - NO ARTIST";
		return artists.map((ar) => ar.name).join(", ");
	};

	const handleConfirm = () => {
		onConfirm(content?.partNumber, selectedSongs);
		setSelectedSongs([]);
		setContent(false);
	};

	const renderContent = () => {
		return (
			<FlatList
				contentContainerStyle={{
					width: "100%",
					alignItems: "flex-start",
				}}
				style={{
					flex: 1,
					width: "100%",
				}}
				data={content?.availableSongs}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => {
					const order = getOrderNumber(item.id);
					const isSelected = !!order;
					const artist = constructArtistName(item.artist);
					return (
						<TouchableOpacity
							onPress={() => toggleSong(item)}
							style={{
								flexDirection: "row",
								alignItems: "center",
								paddingVertical: 8,
								width: "100%",
							}}>
							<ThemedView
								style={{
									width: 30,
									height: 30,
									borderRadius: 15,
									borderWidth: 1,
									borderColor: isSelected ? "#DA291C" : colors.placeholder,
									backgroundColor: isSelected ? "#DA291C" : colors.background,
									justifyContent: "center",
									alignItems: "center",
									marginRight: 8,
								}}>
								{isSelected && (
									<ThemedText
										style={{
											fontSize: 10,
											lineHeight: 14,
											textAlign: "center",
										}}>
										{order}
									</ThemedText>
								)}
							</ThemedView>
							<ThemedText>
								{item.title} ({artist})
							</ThemedText>
						</TouchableOpacity>
					);
				}}
			/>
		);
	};

	return (
		<Modal
			visible={!!content}
			transparent={true}
			animationType="fade"
			onRequestClose={() => setContent(false)}>
			<Pressable
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundColor: "rgba(0,0,0,0.3)",
					justifyContent: "center",
					alignItems: "center",
				}}
				onPress={() => setContent(null)}>
				<Pressable
					style={{
						width: "95%",
						maxHeight: "85%",
						height: "85%",
						borderRadius: 10,
						padding: 20,
						shadowColor: "#000",
						shadowOffset: {
							width: 0,
							height: 4,
						},
						shadowOpacity: 0.25,
						shadowRadius: 8,
						elevation: 5,
						flexDirection: "column",
						gap: 16,
						borderWidth: 2,
						borderColor: "white",
						alignItems: "center",
						backgroundColor: colors.background,
					}}
					onPress={(e) => e.stopPropagation()}>
					<ThemedText style={{ fontWeight: "bold" }}>
						Pick songs for Part #{content?.partNumber}
					</ThemedText>
					<ThemedView style={{ flex: 1, width: "100%" }}>
						{renderContent()}
					</ThemedView>

					<ThemedView
						style={{
							flexDirection: "row",
							gap: 8,
						}}>
						<TouchableOpacity
							onPress={() => setContent(false)}
							style={{
								padding: 8,
								// backgroundColor: colors.background,
								borderRadius: 12,
								alignItems: "center",
								width: "40%",
								borderWidth: 1,
								borderColor: colors.text,
							}}>
							<ThemedText>Close</ThemedText>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={handleConfirm}
							style={{
								padding: 8,
								backgroundColor: colors.accent,
								borderRadius: 12,
								alignItems: "center",
								width: "40%",
								borderWidth: 1,
								borderColor: colors.text,
							}}>
							<ThemedText
								style={{
									fontWeight: "bold",
								}}>
								Save
							</ThemedText>
						</TouchableOpacity>
					</ThemedView>
				</Pressable>
			</Pressable>
		</Modal>
	);
}
