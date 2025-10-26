import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import InfoModal from "@/components/ui/InfoModal";
import LyricsRenderer from "@/components/ui/LyricsRenderer";
import Metronome from "@/components/ui/Metronome";
import Tag from "@/components/ui/Tag";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Show, TagType } from "@/types";
import { formatDuration } from "@/utils/dateUtils";
import { getSingleParam } from "@/utils/paramUtils";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

export default function SongDetailScreen() {
	const [modalInfo, setModalInfo] = useState<any>(undefined);
	const colorScheme = useColorScheme();
	const currentTheme = Colors[colorScheme ?? "light"];
	const { duration, lyrics, shows, tags, title } = useLocalSearchParams();
	const durationNumber = Number(
		Array.isArray(duration) ? duration[0] : duration
	);

	let finalShows: Show[] = [];
	try {
		const rawShows = getSingleParam(shows);
		finalShows = rawShows ? JSON.parse(rawShows) : [];
	} catch (error) {
		console.log("Failed to parse shows", error);
		finalShows = [];
	}

	let finalTags: TagType[] = [];
	try {
		const rawTags = getSingleParam(tags);
		finalTags = rawTags ? JSON.parse(rawTags) : [];
	} catch (error) {
		console.error("Failed to parse tags:", error);
		finalTags = [];
	}

	const navigation = useNavigation();
	useLayoutEffect(() => {
		navigation.setOptions({
			title,
		});
	}, [navigation, title]);

	const songData = [
		{
			label: "Duration",
			value: formatDuration(durationNumber),
			opensModal: false,
		},
		{
			label: "Shows",
			value: finalShows.length,
			modalValue: finalShows,
			opensModal: true,
		},
		0,
		{
			label: "Key (-2)",
			value: (
				<ThemedView
					style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
					<ThemedText style={{ fontSize: 12 }}>A</ThemedText>
					<MaterialIcons
						size={20}
						name="arrow-right-alt"
						color="white"
					/>
					<ThemedText style={{ fontSize: 12 }}>C</ThemedText>
				</ThemedView>
			),
			opensModal: false,
		},
	];

	const songDataComponents = [
		<Metronome
			key={2}
			label="BPM"
			value={120}
			containerStyle={{
				borderColor: "white",
				width: `${85 / 4}%`,
			}}
			contentStyle={{ fontSize: 12 }}
		/>,
	];

	const renderInfo = (item: any, index: number) => {
		const isTouchable = item.opensModal;
		const Wrapper: React.ElementType = isTouchable
			? TouchableOpacity
			: ThemedView;
		const labelText = isTouchable ? (
			<ThemedView
				style={{
					flexDirection: "row",
					alignItems: "center",
					gap: 2,
				}}>
				<ThemedText style={{ fontSize: 12 }}>{item.label}</ThemedText>
				<MaterialIcons
					color={currentTheme.text}
					size={12}
					name="open-in-new"
				/>
			</ThemedView>
		) : (
			item.label
		);

		return (
			<Wrapper
				key={`song-data-${index}`}
				style={[
					styles.songItem,
					{
						width: `${85 / songData.length}%`,
						borderWidth: 1,
					},
				]}
				onPress={item.opensModal ? () => setModalInfo(item) : undefined}>
				<ThemedText style={styles.songItemText}>{labelText}</ThemedText>
				<ThemedText style={styles.songItemText}>{item.value}</ThemedText>
			</Wrapper>
		);
	};

	return (
		<>
			<ThemedView style={styles.songDataItemContainer}>
				{[songData[0], songData[1], null, songData[3]].map((item, index) =>
					index === 2 ? songDataComponents[0] : renderInfo(item, index)
				)}
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
			<InfoModal
				modalInfo={modalInfo}
				setModalInfo={setModalInfo}
			/>
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
	informationContainer: {},
	songDataItemContainer: {
		flexDirection: "row",
		justifyContent: "space-evenly",
		marginBottom: 8,
	},
	songItem: {
		flexDirection: "column",
		borderColor: "white",
		borderRadius: 8,
		alignItems: "center",
		padding: 6,
	},
	songItemText: {
		fontSize: 12,
	},
});
