import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect } from "react";

export default function EditShowScreen() {
	const navigation = useNavigation();
	const { title } = useLocalSearchParams();

	useLayoutEffect(() => {
		navigation.setOptions({
			title: title || "Add Show",
		});
	}, [navigation, title]);
	return (
		<ThemedView>
			<ThemedText>ADD/EDIT SHOW</ThemedText>
		</ThemedView>
	);
}
