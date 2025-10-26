import { useColorScheme } from "@/hooks/use-color-scheme";
import { ModalProps } from "@/types";
import { ThemedText } from "../themed-text";

import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { Modal, Pressable, StyleSheet, TouchableOpacity } from "react-native";

export default function InfoModal(modalProps: ModalProps) {
    const { modalInfo, setModalInfo } = modalProps;
    const colorScheme = useColorScheme();
    const theme = colorScheme === "dark" ? DarkTheme : DefaultTheme;

    return (
        <Modal
            visible={!!modalInfo}
            animationType="fade"
            onRequestClose={() => setModalInfo(false)}
            transparent={true}
        >
            <Pressable
                style={styles.wrapper}
                onPress={() => setModalInfo(false)}
            >
                <Pressable
                    style={[
                        styles.inner,
                        { backgroundColor: theme.colors.border },
                    ]}
                    onPress={(e) => e.stopPropagation()}
                >
                    <ThemedText>{modalInfo?.label}</ThemedText>
                    <ThemedText>{modalInfo?.value}</ThemedText>
                    <TouchableOpacity
                        onPress={() => setModalInfo(false)}
                        style={{
                            padding: 12,
                            backgroundColor: theme.colors.background,
                            borderRadius: 24,
                            alignItems: "center",
                            width: '40%',
                            borderWidth: 1,
                            borderColor: theme.colors.text
                        }}
                    >
                        <ThemedText>Close</ThemedText>
                    </TouchableOpacity>
                </Pressable>
            </Pressable>
        </Modal>
    )
};

const styles = StyleSheet.create({
    wrapper: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    inner: {
        width: "85%",
        maxHeight: "70%",
        borderRadius: 10,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
        flexDirection: 'column',
        gap: 16,
        borderWidth: 2,
        borderColor: 'white',
        alignItems: 'center'

    }
});