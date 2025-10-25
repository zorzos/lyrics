import {
	ActivityIndicator,
	FlatList,
	StyleSheet,
	TouchableOpacity,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useQuery } from "@tanstack/react-query";

import { Colors } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { Show } from "@/types";
import { formatDate } from "@/utils/dateUtils";
import { Link } from "expo-router";

async function getShows(): Promise<Show[]> {
	const { data, error } = await supabase
		.from("shows")
		.select("id, title, date")
		.order("date", { ascending: false });

	if (error) throw error;
	return data ?? [];
}

export default function Shows() {
	const colorScheme = useColorScheme();
	const currentTheme = Colors[colorScheme ?? "light"];

	const {
		data: shows,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["shows"],
		queryFn: getShows,
	});

	if (isLoading) {
		return (
			<ThemedView
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
					backgroundColor: currentTheme.background,
				}}>
				<ActivityIndicator
					size="large"
					color={currentTheme.text}
				/>
			</ThemedView>
		);
	}

	if (isError) {
		return (
			<ThemedView
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
					padding: 16,
					backgroundColor: currentTheme.background,
				}}>
				<ThemedText style={{ color: currentTheme.text }}>
					Error loading shows
				</ThemedText>
			</ThemedView>
		);
	}

	return (
		<ThemedView style={styles.container}>
			<FlatList
				data={shows}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => {
					return (
						<Link
							href={{
								pathname: "/show/[id]",
								params: { id: item.id, title: item.title },
							}}
							asChild>
							<TouchableOpacity style={styles.item}>
								<ThemedText style={styles.text}>{`${item.title.substring(
									0,
									15
								)} ${formatDate(new Date(item.date))}`}</ThemedText>
								<MaterialIcons
									color={currentTheme.text}
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
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#ddd",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		flex: 1,
	},
	text: {
		fontSize: 16,
	},
});
