import { Colors } from "@/constants/theme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTheme } from "@react-navigation/native";
import { XMLParser } from "fast-xml-parser";
import { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, useColorScheme } from "react-native";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";

export default function LyricsRenderer({ lyrics } : { lyrics: string }) {
    const { colors } = useTheme();
    const colorScheme = useColorScheme();
    const currentTheme = Colors[colorScheme ?? "light"];
    const [fontSize, setFontSize] = useState(14);
    const increaseFont = () => setFontSize((prev) => Math.min(prev + 2, 40));
    const decreaseFont = () => setFontSize((prev) => Math.max(prev - 2, 10));

    const xmlParser = new XMLParser();
    let parsedLyrics = "";
    try {
        parsedLyrics = xmlParser.parse(lyrics, true);
    } catch (error) {
        console.error("Error parsing lyrics XML:", error);
    }

    console.log("parsed", typeof parsedLyrics);
    
    return (
        <ThemedView style={{ backgroundColor: colors.card }}>
            {/* Font size controls */}
            <ThemedView style={styles.controls}>
                <TouchableOpacity style={styles.button} onPress={decreaseFont}>
                    {/* <ThemedText style={{ fontSize: 16 }}>Zoom out</ThemedText> */}
                    <MaterialIcons
                        color={currentTheme.text}
                        size={18}
                        name="text-decrease"
                    />
                </TouchableOpacity>
                <ThemedText style={styles.fontLabel}>{fontSize}</ThemedText>
                <TouchableOpacity style={styles.button} onPress={increaseFont}>
                    {/* <ThemedText style={{ fontSize: 16 }}>Zoom in</ThemedText> */}
                    <MaterialIcons
                        color={currentTheme.text}
                        size={18}
                        name="text-increase"
                    />
                </TouchableOpacity>
            </ThemedView>

            {/* Lyrics renderer */}
            <ScrollView
                style={{ backgroundColor: colors.card }}
                contentContainerStyle={styles.scrollViewContainer}>
                <ThemedView>
                    <ThemedText style={{ fontSize }}>{lyrics}</ThemedText>
                </ThemedView>
            </ScrollView>
        </ThemedView>
        
    )
};

const styles = StyleSheet.create({
    scrollViewContainer: {
		paddingHorizontal: "1.5%",
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
        flex: 1
    },
    fontLabel: { fontSize: 18, width: 75, textAlign: "center" },
});