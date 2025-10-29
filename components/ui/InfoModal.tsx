import { useColorScheme } from "@/hooks/use-color-scheme";
import { ModalProps, Show } from "@/types";
import { ThemedText } from "../themed-text";

import { formatDate } from "@/utils/dateUtils";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import {
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
} from "react-native";
import { ThemedView } from "../themed-view";

export default function InfoModal(modalProps: ModalProps) {
	const { modalInfo, setModalInfo } = modalProps;
	const colorScheme = useColorScheme();
	const theme = colorScheme === "dark" ? DarkTheme : DefaultTheme;

	const renderModalValue = () => (
		<ScrollView>
			<ThemedView style={styles.modalContentContainer}>
				{modalInfo?.modalValue?.map((item: Show, index: number) => (
					<ThemedText
						key={index}
						style={styles.modalValue}>
						{`${item.title} ${formatDate(new Date(item.date))}`}
					</ThemedText>
				))}
			</ThemedView>
		</ScrollView>
	);

	return (
		<Modal
			visible={!!modalInfo}
			animationType="fade"
			onRequestClose={() => setModalInfo(false)}
			transparent={true}>
			<Pressable
				style={styles.wrapper}
				onPress={() => setModalInfo(false)}>
				<Pressable
					style={[styles.inner, { backgroundColor: theme.colors.border }]}
					onPress={(e) => e.stopPropagation()}>
					<ThemedText>{modalInfo?.label}</ThemedText>
					<ThemedText>{renderModalValue()}</ThemedText>
					<TouchableOpacity
						onPress={() => setModalInfo(false)}
						style={{
							padding: 8,
							backgroundColor: theme.colors.background,
							borderRadius: 12,
							alignItems: "center",
							width: "40%",
							borderWidth: 1,
							borderColor: theme.colors.text,
						}}>
						<ThemedText>Close</ThemedText>
					</TouchableOpacity>
				</Pressable>
			</Pressable>
		</Modal>
	);
}

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
		borderRadius: 10,
		padding: 20,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.25,
		shadowRadius: 8,
		elevation: 5,
		flexDirection: "column",
		gap: 16,
		borderWidth: 2,
		borderColor: "white",
		alignItems: "center",
	},
	modalValue: {
		fontSize: 14,
	},
	modalContentContainer: {
		backgroundColor: "transparent",
		gap: 4,
	},
});
