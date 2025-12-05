import { normaliseLyric, parseLyrics } from "@/utils/songUtils";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";

import { useColors } from "@/hooks/use-colors";
import { useTagColors } from "@/hooks/useTags";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useState } from "react";
import {
	ScrollView,
	StyleSheet,
	TouchableOpacity
} from "react-native";

const MIN_FONT_SIZE = 12;
const DEFAULT_FONT_SIZE = 14;
const MAX_FONT_SIZE = 36;
const ICON_SIZE = 18;

export default function LyricsRenderer({ lyrics }: { lyrics: string }) {
	const colors = useColors();
	const tagColors = useTagColors();
	const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
	const increaseFont = () =>
		setFontSize((prev) =>
			prev === MAX_FONT_SIZE ? MAX_FONT_SIZE : Math.min(prev + 2, 40)
		);
	const decreaseFont = () =>
		setFontSize((prev) =>
			prev === MIN_FONT_SIZE ? MIN_FONT_SIZE : Math.max(prev - 2, 10)
		);

	const isIncreaseDisabled = fontSize === MAX_FONT_SIZE;
	const isDecreaseDisabled = fontSize === MIN_FONT_SIZE;

	const renderLine = (
		line: string | Record<string, unknown>,
		lineIndex: number,
		elementType: string
	) => {
		const isObjectLine = typeof line === "object" && line !== null;
		const tagString = isObjectLine && "tag" in line ? String(line.tag) : "";
		const lineTags = tagString ? tagString.split(",") : [];

		const lyric = typeof line === "string" ? line : normaliseLyric(line);

		return (
			<ThemedView
				key={`${elementType}-line-${lineIndex + 1}`}
				style={{
					flexDirection: "row",
					alignItems: "center",
					marginVertical: 2,
					gap: 2,
				}}>
				{lineTags.map((tag) => {
					const color = tagColors[tag.trim().toLowerCase()] ?? "transparent";
					return (
						<ThemedView
							key={tag}
							style={{
								width: 6,
								height: 6,
								borderRadius: 3,
								backgroundColor: color,
								marginRight: 4,
							}}
						/>
					);
				})}
				<ThemedText
					style={{
						fontSize,
						color: colors.text,
						lineHeight: fontSize + 6,
					}}>
					{lyric}
				</ThemedText>
			</ThemedView>
		);
	};

	return (
		<ThemedView style={{ backgroundColor: colors.background, flex: 1 }}>
			{/* Font size controls */}
			{lyrics && (
				<ThemedView style={styles.controls}>
					<TouchableOpacity
						style={[styles.button, isDecreaseDisabled && styles.disabledButton]}
						onPress={decreaseFont}
						disabled={isDecreaseDisabled}>
						<MaterialIcons
							color={colors.text}
							size={ICON_SIZE}
							name={isDecreaseDisabled ? "block" : "text-decrease"}
						/>
					</TouchableOpacity>
					<ThemedText style={styles.fontLabel}>{fontSize}</ThemedText>
					<TouchableOpacity
						style={[styles.button, isIncreaseDisabled && styles.disabledButton]}
						onPress={increaseFont}
						disabled={isIncreaseDisabled}>
						<MaterialIcons
							color={colors.text}
							size={ICON_SIZE}
							name={isIncreaseDisabled ? "block" : "text-increase"}
						/>
					</TouchableOpacity>
				</ThemedView>
			)}

			{/* Lyrics renderer */}
			{lyrics ? (
				<ScrollView
					style={{ backgroundColor: colors.background }}
					contentContainerStyle={styles.scrollViewContainer}>
					<ThemedView style={{ marginTop: fontSize }}>
						{parseLyrics(lyrics).map((element, index: number) => (
							<ThemedView
								style={lyricStyles.common}
								key={index}>
								<ThemedText
									style={{
										fontSize: fontSize + 2,
										marginBottom: fontSize / 2,
										color: colors.text,
										textTransform: "capitalize",
										lineHeight: fontSize + 6,
									}}>
									[{element.type}]
								</ThemedText>
								{element.lines.map(
									(line: string | Record<string, unknown>, lineIndex: number) =>
										renderLine(line, lineIndex, element.type)
								)}
							</ThemedView>
						))}
					</ThemedView>
				</ScrollView>
			) : (
				<ThemedView
					style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
					<ThemedText>INSTRUMENTAL</ThemedText>
				</ThemedView>
			)}
		</ThemedView>
	);
}

const lyricStyles = StyleSheet.create({
	common: {
		marginBottom: 10,
	},
	verse: {},
	chorus: {},
	bridge: {},
	special: {},
});

const styles = StyleSheet.create({
	scrollViewContainer: {
		paddingHorizontal: "1.5%",
		paddingBottom: "10%",
	},
	controls: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 6,
		width: "100%",
		paddingHorizontal: "2.5%",
	},
	button: {
		backgroundColor: "#333",
		paddingVertical: 6,
		borderRadius: 8,
		alignItems: "center",
		flex: 1,
	},
	disabledButton: {
		backgroundColor: "#a5a5a5",
		opacity: 0.5,
	},
	fontLabel: {
		fontSize: 16,
		textAlign: "center",
		flex: 2,
	},
});
