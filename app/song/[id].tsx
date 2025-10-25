import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import LyricsRenderer from "@/components/ui/LyricsRenderer";
import Tag from "@/components/ui/Tag";
import { TagType } from "@/types";
import { formatDuration } from "@/utils/dateUtils";

import { useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

export default function SongDetailScreen() {
	const { title, lyrics, tags, duration } = useLocalSearchParams();
	const durationNumber = Number(Array.isArray(duration) ? duration[0] : duration);

	let finalTags: TagType[] = [];
	try {
		const rawTags = Array.isArray(tags) ? tags[0] : tags;
		finalTags = rawTags ? JSON.parse(rawTags) : [];
	} catch (e) {
		console.error("Failed to parse tags:", e);
		finalTags = [];
	}

	const navigation = useNavigation();
	useLayoutEffect(() => {
		navigation.setOptions({
			title: title || "Song Details",
		});
	}, [navigation, title]);

	return (
		<>
			<ThemedView style={styles.informationContainer}>
				<ThemedView
					style={{
						flexDirection: "row",
						justifyContent: "space-evenly",
						marginBottom: 8,
					}}
				>
					{[...Array(5).keys()].map((_, index) => (
						<TouchableOpacity
							key={index}
							style={{
								flexDirection: "column",
								borderWidth: 2,
								borderColor: ['red', 'blue', 'green', 'orange', 'purple'][index],
								borderRadius: 8,
								alignItems: 'center',
								padding: 5,
							}}
						>
							<ThemedText style={{ fontSize: 14 }}>{['Duration', 'Shows', 'Recent', '1', '2'][index]}</ThemedText>
							<ThemedText style={{ fontSize: 14 }}>{formatDuration(durationNumber)}</ThemedText>
						</TouchableOpacity>
					))}
					
				</ThemedView>
			</ThemedView>
			<ThemedView style={styles.tagsContainer}>
				{finalTags.map((tag: TagType) => (
					<ThemedView
						key={tag.id}
						style={styles.individualTagContainer}>
						<Tag tag={tag} />
					</ThemedView>
				))}
			</ThemedView>
			<LyricsRenderer lyrics={Array.isArray(lyrics) ? lyrics[0] : lyrics} />
		</>
	);
}

const styles = StyleSheet.create({
	scrollViewContainer: {
		paddingHorizontal: "1.5%",
	},
	tagsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		paddingHorizontal: "1.5%",
	},
	individualTagContainer: {
		padding: 2,
	},
	informationContainer: {
	}
});
