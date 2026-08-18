import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColors } from "@/hooks/use-colors";
import { Modal, StyleSheet, TouchableOpacity } from "react-native";

interface ConfirmModalProps {
    visible: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    destructive?: boolean;
}

export default function ConfirmModal({
    visible,
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
    destructive = false,
}: ConfirmModalProps) {
    const colors = useColors();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onCancel}>
            <ThemedView style={styles.overlay}>
                <ThemedView style={[styles.card, { backgroundColor: colors.background, borderColor: colors.placeholder }]}>
                    <ThemedText style={[styles.title, { color: colors.text }]}>{title}</ThemedText>
                    <ThemedText style={[styles.message, { color: colors.placeholder }]}>{message}</ThemedText>
                    <ThemedView style={[styles.buttons, { borderTopColor: colors.placeholder }]}>
                        <TouchableOpacity
                            style={[styles.button, { borderRightColor: colors.placeholder }]}
                            onPress={onCancel}>
                            <ThemedText style={[styles.buttonText, { color: colors.text }]}>
                                {cancelLabel}
                            </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={onConfirm}>
                            <ThemedText style={[styles.buttonText, { color: destructive ? "#E24B4A" : colors.tint }]}>
                                {confirmLabel}
                            </ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                </ThemedView>
            </ThemedView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    card: {
        width: 280,
        borderRadius: 14,
        borderWidth: 0.5,
        overflow: "hidden",
    },
    title: {
        fontSize: 17,
        fontWeight: "500",
        textAlign: "center",
        paddingTop: 20,
        paddingHorizontal: 16,
        paddingBottom: 4,
    },
    message: {
        fontSize: 13,
        textAlign: "center",
        paddingHorizontal: 16,
        paddingBottom: 20,
        lineHeight: 18,
    },
    buttons: {
        flexDirection: "row",
        borderTopWidth: 0.5,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
        borderRightWidth: 0.5,
    },
    buttonText: {
        fontSize: 17,
    },
});