import { Colors } from "@/constants/theme";
import { parseLyrics } from "@/utils/lyricsUtils";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTheme } from "@react-navigation/native";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    useColorScheme
} from "react-native";

const MIN_FONT_SIZE = 12;
const DEFAULT_FONT_SIZE = 14;
const MAX_FONT_SIZE = 36;
const ICON_SIZE = 18;

export default function LyricsRenderer({ lyrics }: { lyrics: string }) {
    const { colors } = useTheme();
    const colorScheme = useColorScheme();
    const currentTheme = Colors[colorScheme ?? "light"];
    const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
    const increaseFont = () => setFontSize((prev) => (
        prev === MAX_FONT_SIZE ? MAX_FONT_SIZE : Math.min(prev + 2, 40)
    ));
    const decreaseFont = () => setFontSize((prev) => (
        prev === MIN_FONT_SIZE) ? MIN_FONT_SIZE : Math.max(prev - 2, 10)
    );

    const isIncreaseDisabled = fontSize === MAX_FONT_SIZE;
    const isDecreaseDisabled = fontSize === MIN_FONT_SIZE;

    return (
        <ThemedView style={{ backgroundColor: colors.card, flex: 1 }}>
            {/* Font size controls */}
            <ThemedView style={styles.controls}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        isDecreaseDisabled && styles.disabledButton
                    ]}
                    onPress={decreaseFont}
                    disabled={isDecreaseDisabled}
                >
                    {/* <ThemedText style={{ fontSize: 16 }}>Zoom out</ThemedText> */}
                    <MaterialIcons
                        color={currentTheme.text}
                        size={ICON_SIZE}
                        name={isDecreaseDisabled ? "block" : "text-decrease"}
                    />
                </TouchableOpacity>
                <ThemedText style={styles.fontLabel}>{fontSize}</ThemedText>
                <TouchableOpacity
                    style={[
                        styles.button,
                        isIncreaseDisabled && styles.disabledButton
                    ]}
                    onPress={increaseFont}
                    disabled={isIncreaseDisabled}
                >
                    {/* <ThemedText style={{ fontSize: 16 }}>Zoom in</ThemedText> */}
                    <MaterialIcons
                        color={currentTheme.text}
                        size={ICON_SIZE}
                        name={isIncreaseDisabled ? "block" : "text-increase"}
                    />
                </TouchableOpacity>
            </ThemedView>

            {/* Lyrics renderer */}
            <ScrollView
                style={{ backgroundColor: colors.card }}
                contentContainerStyle={styles.scrollViewContainer}>
                <ThemedView style={{ marginTop: fontSize }}>
                    {parseLyrics(lyrics).map((element, index: number) => (
                        <ThemedView style={lyricStyles.common} key={index}>
                            <ThemedText
                                style={{
                                    fontSize: fontSize + 2,
                                    marginBottom: fontSize / 2,
                                    color: colors.text,
                                    textTransform: 'capitalize',
                                    lineHeight: fontSize + 6,
                                }}
                            >
                                [{element.type}]
                            </ThemedText>
                            {element.lines.map((line: string, lineIndex: number) => (
                                <ThemedText
                                    key={`${element.type}-line-${lineIndex + 1}`}
                                    style={{
                                        fontSize,
                                        color: colors.text,
                                        lineHeight: fontSize + 6,
                                    }}
                                >
                                    {line}
                                </ThemedText>
                            ))}
                        </ThemedView>
                    ))}
                </ThemedView>
            </ScrollView>
        </ThemedView>
    )
};

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