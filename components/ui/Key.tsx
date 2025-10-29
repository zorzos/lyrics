import { KeyProps } from "@/types";
import { semitoneDifference } from "@/utils/songUtils";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StyleSheet } from "react-native";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";

export default function Key({
    originalKey,
    spKey,
    containerStyle
}: KeyProps) {
    const keyDifference = spKey ? semitoneDifference(originalKey, spKey) : 'OG';

    return (
        <ThemedView style={[styles.container, containerStyle]}>
            <ThemedText style={styles.label}>Key ({keyDifference})</ThemedText>
            <ThemedView
                style={styles.view}>
                <ThemedText style={styles.label}>{originalKey}</ThemedText>
                {spKey && <><MaterialIcons
                    size={20}
                    name="arrow-right-alt"
                    color="white"
                />
                    <ThemedText style={styles.label}>{spKey}</ThemedText></>}
            </ThemedView>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        borderRadius: 8,
        alignItems: "center",
        padding: 6,
        borderWidth: 1
    },
    label: {
        fontSize: 12
    },
    view: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4
    }
});