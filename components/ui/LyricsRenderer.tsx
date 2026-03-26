import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useSettings } from "@/context/SettingsContext";
import { ColorTheme, useColors } from "@/hooks/use-colors";
import { useDevice } from "@/hooks/use-device";
import { useTagColors } from "@/hooks/useTags";
import { LyricBlock, LyricLine, Segment, parseLyrics } from "@/utils/songUtils";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";

const MIN_FONT_SIZE = 12;
const DEFAULT_FONT_SIZE_PHONE = 16;
const DEFAULT_FONT_SIZE_TABLET = 20;
const MAX_FONT_SIZE = 50;
const ICON_SIZE = 18;

const getSegmentColors = (
	tags: string[],
	tagColors: Record<string, string>,
): string[] => {
	const colors = tags.map((tag) => tagColors[tag] ?? null).filter(Boolean);
	return colors.length > 0 ? colors : [];
};

const SegmentText = ({
	segment,
	fontSize,
	textColor,
	tagColors,
	highlightStyle,
}: {
	segment: Segment;
	fontSize: number;
	textColor: string;
	tagColors: Record<string, string>;
	highlightStyle: string;
}) => {
	const segmentColors = getSegmentColors(segment.tags, tagColors);
	const hasColors = segmentColors.length > 0;

	// Ensure at least 2 colors for LinearGradient
	const gradientColors = hasColors
		? segmentColors.length === 1
			? [segmentColors[0], segmentColors[0]]
			: segmentColors
		: null;

	const textElement = (
		<ThemedText
			style={{ fontSize, color: textColor, lineHeight: fontSize + 6 }}>
			{segment.text}
		</ThemedText>
	);

	if (!hasColors || highlightStyle === "none") return textElement;

	if (highlightStyle === "background") {
		return (
			<LinearGradient
				colors={gradientColors as [string, string, ...string[]]}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 0 }}
				style={{ borderRadius: 4, paddingHorizontal: 2 }}>
				{textElement}
			</LinearGradient>
		);
	}

	if (highlightStyle === "underline") {
		return (
			<ThemedView>
				{textElement}
				<ThemedView style={{ flexDirection: "column", gap: 2, marginTop: 1 }}>
					{segment.tags.length === 0
						? null
						: segment.tags.map((tag, i) => {
								const color = tagColors[tag] ?? "transparent";
								return (
									<ThemedView
										key={i}
										style={{
											height: 4,
											borderRadius: 1,
											backgroundColor: color,
										}}
									/>
								);
							})}
				</ThemedView>
			</ThemedView>
		);
	}

	if (highlightStyle === "border") {
		return (
			<ThemedView
				style={{
					borderLeftWidth: 3,
					borderLeftColor: segmentColors[0],
					paddingLeft: 4,
				}}>
				{textElement}
			</ThemedView>
		);
	}

	return textElement;
};

const renderLine = (
	line: LyricLine,
	lineIndex: number,
	elementType: string,
	fontSize: number,
	textColor: string,
	tagColors: Record<string, string>,
	highlightStyle: string,
) => {
	return (
		<ThemedView
			key={`${elementType}-line-${lineIndex + 1}`}
			style={{
				flexDirection: "row",
				alignItems: "flex-start",
				marginVertical: 2,
				flexWrap: "wrap",
			}}>
			{line.map((segment, segIndex) => (
				<SegmentText
					key={segIndex}
					segment={segment}
					fontSize={fontSize}
					textColor={textColor}
					tagColors={tagColors}
					highlightStyle={highlightStyle}
				/>
			))}
		</ThemedView>
	);
};

const createStyles = (colors: ColorTheme) =>
	StyleSheet.create({
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
			backgroundColor: colors.text,
			color: colors.background,
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

export default function LyricsRenderer({ lyrics }: { lyrics: string }) {
	const { isTablet } = useDevice();
	const colors = useColors();
	const styles = createStyles(colors);
	const tagColors = useTagColors();
	const { highlightStyle } = useSettings();
	const defaultFontSize = isTablet
		? DEFAULT_FONT_SIZE_TABLET
		: DEFAULT_FONT_SIZE_PHONE;
	const [fontSize, setFontSize] = useState(defaultFontSize);
	const increaseFont = () =>
		setFontSize((prev) =>
			prev === MAX_FONT_SIZE
				? MAX_FONT_SIZE
				: Math.min(prev + 2, MAX_FONT_SIZE),
		);
	const decreaseFont = () =>
		setFontSize((prev) =>
			prev === MIN_FONT_SIZE
				? MIN_FONT_SIZE
				: Math.max(prev - 2, MIN_FONT_SIZE),
		);

	const isIncreaseDisabled = fontSize === MAX_FONT_SIZE;
	const isDecreaseDisabled = fontSize === MIN_FONT_SIZE;

	return (
		<ThemedView style={{ backgroundColor: colors.background, flex: 1 }}>
			{lyrics && (
				<ThemedView style={styles.controls}>
					<TouchableOpacity
						style={[styles.button, isDecreaseDisabled && styles.disabledButton]}
						onPress={decreaseFont}
						disabled={isDecreaseDisabled}>
						<MaterialIcons
							color={colors.background}
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
							color={colors.background}
							size={ICON_SIZE}
							name={isIncreaseDisabled ? "block" : "text-increase"}
						/>
					</TouchableOpacity>
				</ThemedView>
			)}

			{lyrics ? (
				<ScrollView
					style={{ backgroundColor: colors.background }}
					contentContainerStyle={styles.scrollViewContainer}>
					<ThemedView style={{ marginTop: fontSize }}>
						{parseLyrics(lyrics).map((block: LyricBlock, index: number) => (
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
									[{block.type}
									{block.repeatIndex > 1 ? ` x${block.repeatIndex}` : ""}]
								</ThemedText>
								{block.lines.map((line: LyricLine, lineIndex: number) =>
									renderLine(
										line,
										lineIndex,
										block.type,
										fontSize,
										colors.text,
										tagColors,
										highlightStyle,
									),
								)}
							</ThemedView>
						))}
					</ThemedView>
				</ScrollView>
			) : (
				<ThemedView
					style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
					<ThemedText>[INSTRUMENTAL]</ThemedText>
				</ThemedView>
			)}
		</ThemedView>
	);
}

const lyricStyles = StyleSheet.create({
	common: { marginBottom: 10 },
});
