import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function Stats() {
	return (
		<ThemedView style={{ flex: 1, padding: 20, display: "flex", gap: 10 }}>
			<ThemedText style={{ fontWeight: "bold" }}>Various Stats</ThemedText>
		</ThemedView>
	);
}
