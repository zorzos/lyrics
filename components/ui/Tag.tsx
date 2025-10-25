import { TagType } from "@/types";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";

export default function Tag({ tag }: { tag: TagType }) {
	return (
		<ThemedView
			style={{
				backgroundColor: tag.color || "#555",
				paddingHorizontal: 8,
				paddingVertical: 4,
				borderRadius: 8,
				marginRight: 6,
				marginBottom: 6,
			}}>
			<ThemedText style={{ color: "white", textAlign: "center", fontSize: 12 }}>
				{tag.name}
			</ThemedText>
		</ThemedView>
	);
}
