import { useColors } from "@/hooks/use-colors";
import React, { useEffect, useState } from "react";
import {
	FlatList,
	Keyboard,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	View
} from "react-native";
import Toast from "react-native-toast-message";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";

interface AutocompleteInputProps<T> {
	value: T | null;
	onChange: (item: T | null | { isNew: true; label: string }) => void;
	fetchData: () => Promise<T[]>;
	labelKey: keyof T;
	valueKey: keyof T;
	createItem?: (label: string) => Promise<T>;
	placeholder?: string;
}

export default function AutocompleteInput<T extends Record<string, any>>({
	value,
	onChange,
	fetchData,
	labelKey,
	valueKey,
	createItem,
}: AutocompleteInputProps<T>) {
	const colors = useColors();

	const [items, setItems] = useState<T[]>([]);
	const [query, setQuery] = useState(value ? String(value[labelKey]) : "");
	const [filteredItems, setFilteredItems] = useState<T[]>([]);
	const [loading, setLoading] = useState(false);
	const [showResults, setShowResults] = useState(false);

	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
				const data = await fetchData();
				setItems(data);
			} catch (e) {
				console.error(e);
				Toast.show({ type: "error", text1: "Failed to load data" });
			} finally {
				setLoading(false);
			}
		})();
	}, [fetchData]);

	useEffect(() => {
		const q = query.toLowerCase().trim();
		if (!q) {
			setFilteredItems([]);
			setShowResults(false);
			return;
		}
		const filtered = items.filter((i) =>
			String(i[labelKey]).toLowerCase().includes(q)
		);
		setFilteredItems(filtered);
		setShowResults(true);
	}, [query, items, labelKey]);

	const handleSelect = (item: T) => {
		onChange(item);
		setQuery(String(item[labelKey]));
		setShowResults(false);
		Keyboard.dismiss();
	};

	const handleCreateSelect = () => {
		onChange({ isNew: true, label: query.trim() });
		setShowResults(false);
		Keyboard.dismiss();
	};

	const renderItem = ({ item }: { item: T }) => (
		<TouchableOpacity
			style={[styles.item, { backgroundColor: colors.background }]}
			onPress={() => handleSelect(item)}>
			<ThemedText>{item[labelKey]}</ThemedText>
		</TouchableOpacity>
	);

	const showCreateOption =
		createItem &&
		query.trim() &&
		!loading &&
		!items.some(
			(i) => String(i[labelKey]).toLowerCase() === query.trim().toLowerCase()
		);

	return (
		<ThemedView style={{ position: "relative", zIndex: 9999 }}>
			<TextInput
				value={query}
				onChangeText={setQuery}
				onFocus={() => setShowResults(true)}
				placeholder="Tap to lookup artists"
				placeholderTextColor="lightgray"
				style={[
					styles.input,
					{
						color: colors.text,
						borderColor: colors.text,
						backgroundColor: colors.background,
						marginBottom: 12
					},
				]}
			/>

			{showResults && (filteredItems.length > 0 || showCreateOption) && (
				<View
					style={[
						styles.listContainer,
						{
							backgroundColor: colors.background,
							borderColor: colors.text,
							elevation: 10,
							shadowColor: "#000",
							shadowOpacity: 0.15,
							zIndex: 9999
						},
					]}>
					<FlatList
						data={filteredItems}
						keyExtractor={(item) => String(item[valueKey])}
						renderItem={renderItem}
						keyboardShouldPersistTaps="handled"
						style={{ maxHeight: 200 }}
						ListFooterComponent={
							showCreateOption ? (
								<TouchableOpacity
									style={[styles.item, { backgroundColor: colors.background }]}
									onPress={handleCreateSelect}>
									<ThemedText style={{ fontWeight: "500" }}>
										Create "{query.trim()}"
									</ThemedText>
								</TouchableOpacity>
							) : null
						}
					/>
				</View>
			)}
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	input: {
		borderWidth: 1,
		borderRadius: 6,
		fontSize: 16,
		padding: 8
	},
	listContainer: {
		position: "absolute",
		top: 48,
		left: 0,
		right: 0,
		borderWidth: 1,
		borderRadius: 6,
		maxHeight: 200,
		overflow: "hidden",
	},
	item: {
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: "#ccc",
	},
});
