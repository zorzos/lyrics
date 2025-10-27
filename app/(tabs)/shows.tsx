import {
	ActivityIndicator,
	SectionList,
	StyleSheet,
	TouchableOpacity,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useQuery } from "@tanstack/react-query";

import { Colors } from "@/constants/theme";
import { getShows } from "@/lib/queries/shows";
import { formatDate } from "@/utils/dateUtils";
import { generateHref } from "@/utils/paramUtils";
import { categoriseShows } from "@/utils/showUtils"; // your new helper
import { Link } from "expo-router";

export default function Shows() {
	const colorScheme = useColorScheme();
	const currentTheme = Colors[colorScheme ?? "light"];

	const {
		data: shows,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["allShows"],
		queryFn: () => getShows(),
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

	if (isError || !shows) {
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

	// Categorize using helper
	const sections = categoriseShows(shows).filter(
		(section) => section.data.length > 0
	);

	return (
		<ThemedView style={styles.container}>
			<SectionList
				sections={sections}
				keyExtractor={(item) => item.id}
				renderSectionHeader={({ section: { title } }) => (
					<ThemedText
						style={[styles.sectionHeader, { color: currentTheme.text }]}>
						{title}
					</ThemedText>
				)}
				renderItem={({ item }) => (
					<Link
						href={generateHref("viewShow", { id: item.id, title: item.title })}
						asChild>
						<TouchableOpacity style={styles.item}>
							<ThemedText style={[styles.text, { color: currentTheme.text }]}>
								{`${item.title.substring(0, 15)} ${formatDate(
									new Date(item.date)
								)}`}
							</ThemedText>
							<MaterialIcons
								color={currentTheme.text}
								size={28}
								name="play-arrow"
							/>
						</TouchableOpacity>
					</Link>
				)}
			/>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, paddingHorizontal: "2.5%" },
	sectionHeader: {
		fontSize: 18,
		fontWeight: "bold",
		marginTop: 16,
		marginBottom: 8,
	},
	item: {
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#lightgray",
		borderBottomEndRadius: 16,
		borderBottomStartRadius: 16,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		flex: 1,
	},
	text: { fontSize: 16 },
});
