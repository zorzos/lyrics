import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, TouchableOpacity } from "react-native";

import { MetronomeProps } from "@/types";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";

export default function Metronome({
    label,
    value,
    index,
    containerStyle,
    contentStyle,
}: MetronomeProps) {
    const [running, setRunning] = useState(false);
    const pulseAnim = useRef(new Animated.Value(0)).current;

    const toggleMetronome = () => {
        if (running) {
            setRunning(false);
            pulseAnim.setValue(0);
        } else {
            setRunning(true);
        }
    };

    useEffect(() => {
        if (!running) return;

        const beatDuration = 60000 / value;

        const animate = () => {
            pulseAnim.setValue(1);
            Animated.timing(pulseAnim, {
                toValue: 0,
                duration: beatDuration * 0.8,
                easing: Easing.out(Easing.ease),
                useNativeDriver: false,
            }).start(() => {
                if (running) animate();
            });
        };
        animate();
    }, [running, value]);

    return (
        <TouchableOpacity
            key={`song-data-${index}`}
            style={[styles.container, containerStyle]}
            onPress={toggleMetronome}
        >
            <ThemedView style={styles.view}>
                <ThemedText style={styles.label}>{label}</ThemedText>
                <Animated.View
                    style={[
                        styles.ledIndicator,
                        {
                            opacity: running ? pulseAnim : 1,
                            backgroundColor: running ? "red" : "#FFF",
                        },
                    ]}
                />
            </ThemedView>
            <ThemedText style={contentStyle}>{value}</ThemedText>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    ledIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    container: {
        flexDirection: "column",
        borderWidth: 1,
        borderRadius: 8,
        alignItems: 'center',
        padding: 6,
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
