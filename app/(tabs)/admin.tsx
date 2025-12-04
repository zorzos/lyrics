import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function Admin() {
	return (
		<ThemedView style={{ flex: 1 }}>
			<ThemedText style={{ textAlign: "center" }}>ADMIN SETTINGS</ThemedText>
		</ThemedView>
	);
}
