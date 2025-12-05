import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColors } from "@/hooks/use-colors";
import { useShowSongs } from "@/hooks/useSongs";
import { ShowInfoTypes } from "@/types";
import { generateHref, getSingleParam } from "@/utils/paramUtils";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Link, useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect } from "react";
import {
	ActivityIndicator,
	FlatList,
	StyleSheet,
	TouchableOpacity,
} from "react-native";

export default function ShowDetailScreen() {
	const colors = useColors();
	const { id, title, date } = useLocalSearchParams();
	const showId: string | undefined = getSingleParam(id);
	const showDate = getSingleParam(date);

	const navigation = useNavigation();
	const {
		data: songs,
		isLoading,
		isError,
	} = useShowSongs(showId);

	useLayoutEffect(() => {
		navigation.setOptions({
			title: title || "Show Details",
		});
	}, [navigation, title]);

	if (isLoading)
		return (
			<ThemedView
				style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator size="large" />
			</ThemedView>
		);

	if (isError)
		return (
			<ThemedView
				style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ThemedText>Error loading songs</ThemedText>
			</ThemedView>
		);

	return (
		<ThemedView
			style={{
				// flex: 1,
				backgroundColor: colors.background,
				paddingHorizontal: "2.5%",
			}}>
			<ThemedView
				style={{ gap: 8, paddingVertical: 8, backgroundColor: "transparent" }}>
				<ThemedView
					style={{
						backgroundColor: "transparent",
						flexDirection: "row",
						justifyContent: "space-between",
						gap: 8,
					}}>
					{[
						{
							label: "Date",
							value: showDate ? new Date(showDate).toDateString() : "N/A",
							type: ShowInfoTypes.DATE,
						},
						{
							label: "Tap for Location",
							value: null,
							type: ShowInfoTypes.LOCATION,
						},
					].map((item, i) => {
						const isLocation = item.type === ShowInfoTypes.LOCATION;
						const Wrapper: React.ElementType = isLocation
							? TouchableOpacity
							: ThemedView;
						return (
							<Wrapper
								key={i}
								style={{
									borderWidth: 1,
									borderColor: "grey",
									borderRadius: 8,
									padding: 8,
									flex: 1,
									flexDirection: "column",
									justifyContent: "center",
									alignItems: isLocation ? "center" : "left",
								}}
								onPress={() => console.log("LOCATION MODAL HERE")}>
								<ThemedText>{item.label}</ThemedText>
								{item.value && <ThemedText>{item.value}</ThemedText>}
							</Wrapper>
						);
					})}
				</ThemedView>
				<ThemedView
					style={{
						backgroundColor: "transparent",
						flexDirection: "row",
						justifyContent: "space-between",
						gap: 8,
					}}>
					{[
						{ label: "Type", value: "SP Gig", type: ShowInfoTypes.TYPE },
						{
							label: "Time",
							value: showDate ? new Date(showDate).toLocaleTimeString() : "N/A",
							type: ShowInfoTypes.TIME,
						},
					].map((item, i) => (
						<ThemedView
							key={i}
							style={{
								borderWidth: 1,
								borderColor: "grey",
								borderRadius: 8,
								padding: 8,
								flex: 1,
							}}>
							<ThemedText>{item.label}</ThemedText>
							<ThemedText>{item.value}</ThemedText>
						</ThemedView>
					))}
				</ThemedView>
			</ThemedView>

			{songs?.parts.map((part, i) => {
				return (
					<ThemedView
						key={i}
						style={{ backgroundColor: "transparent" }}>
						<ThemedText style={{ fontSize: 18 }}>
							Part {part.partNumber}
						</ThemedText>
						<FlatList
							data={part.songs}
							keyExtractor={(item) => item.id}
							renderItem={({ item }) => {
								return (
									<Link
										href={generateHref("viewSong", {
											id: item.id,
										})}
										asChild>
										<TouchableOpacity style={styles.item}>
											<ThemedText style={styles.text}>{item.title}</ThemedText>
											<MaterialIcons
												color="white"
												size={28}
												name="play-arrow"
											/>
										</TouchableOpacity>
									</Link>
								);
							}}
						/>
					</ThemedView>
				);
			})}
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: "2.5%",
	},
	item: {
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#ddd",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		flex: 1,
	},
	text: {
		fontSize: 16,
		display: "flex",
		gap: 4,
	},
	alphabetContainer: {
		position: "absolute",
		right: 0,
		top: 0,
		bottom: 0,
		justifyContent: "center",
		paddingVertical: 16,
		width: 24,
	},
	letterContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
});
