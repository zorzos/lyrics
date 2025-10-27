import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getSongs } from "@/lib/queries/songs";
import { generateHref, getSingleParam } from "@/utils/paramUtils";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTheme } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect } from "react";
import {
	ActivityIndicator,
	FlatList,
	StyleSheet,
	TouchableOpacity,
} from "react-native";

export default function ShowDetailScreen() {
	const { colors } = useTheme();
	const { id, title } = useLocalSearchParams<{
		id?: string | string[];
		title: string | string[];
	}>();
	let showId: string | undefined = getSingleParam(id);

	const navigation = useNavigation();
	const {
		data: songs,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["showSongs", showId],
		queryFn: () => getSongs(showId),
		enabled: !!showId,
	});

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
				flex: 1,
				backgroundColor: colors.background,
				paddingHorizontal: "2.5%",
				paddingTop: "2.5%",
			}}>
			<FlatList
				data={songs}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => {
					return (
						<Link
							href={generateHref("viewSong", {
								id: item.id,
								title: item.title,
								lyrics: item.lyrics,
								tags: JSON.stringify(item.tags),
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
