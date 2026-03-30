import { useColors } from "@/hooks/use-colors";
import { KeyProps } from "@/types";
import { semitoneDifference } from "@/utils/songUtils";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StyleSheet } from "react-native";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";

const styles = StyleSheet.create({
	container: {
		flexDirection: "column",
		alignItems: "center",
		padding: 6,
	},
	label: {
		fontSize: 16,
	},
	keyText: {
		fontSize: 10,
	},
	view: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
});

export default function Key({ originalKey, spKey, fontSize }: KeyProps) {
	const colors = useColors();
	const keyDifference = spKey ? semitoneDifference(originalKey, spKey) : "OG";

	return (
		<ThemedView style={styles.container}>
			<ThemedText style={styles.label}>Key ({keyDifference})</ThemedText>
			<ThemedView style={styles.view}>
				<ThemedText style={{ fontSize }}>{originalKey}</ThemedText>
				{spKey && (
					<>
						<MaterialIcons
							size={20}
							name="arrow-right-alt"
							color={colors.text}
						/>
						<ThemedText style={{ fontSize }}>{spKey}</ThemedText>
					</>
				)}
			</ThemedView>
		</ThemedView>
	);
}
