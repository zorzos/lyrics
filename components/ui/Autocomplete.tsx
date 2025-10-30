import { useTheme } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
	Keyboard,
	Platform,
	StyleSheet,
	Text,
	TouchableOpacity,
} from "react-native";
import Autocomplete from "react-native-autocomplete-input";
import Toast from "react-native-toast-message";
import { ThemedView } from "../themed-view";

interface AutocompleteInputProps<T> {
	value: T | null;
	onChange: (item: T | null) => void;
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
	const { colors } = useTheme();
	const [query, setQuery] = useState(value ? String(value[labelKey]) : "");
	const [items, setItems] = useState<T[]>([]);
	const [filteredItems, setFilteredItems] = useState<T[]>([]);
	const [loading, setLoading] = useState(false);
	const [showResults, setShowResults] = useState(false);

	useEffect(() => {
		async function loadData() {
			setLoading(true);
			try {
				const data = await fetchData();
				setItems(data);
			} catch (e: any) {
				console.error(e);
				Toast.show({ type: "error", text1: "Failed to load data" });
			} finally {
				setLoading(false);
			}
		}
		loadData();
	}, [fetchData]);

	useEffect(() => {
		const q = query.toLowerCase();
		if (!q.trim()) {
			setFilteredItems([]);
			return;
		}
		setFilteredItems(
			items.filter((i) => String(i[labelKey]).toLowerCase().includes(q))
		);
	}, [query, items, labelKey]);

	const handleSelect = (item: T) => {
		onChange(item);
		setQuery(String(item[labelKey]));
		setFilteredItems([]);
		setShowResults(false);
		Keyboard.dismiss();
	};

	const handleCreate = async () => {
		if (!createItem || !query.trim()) return;
		try {
			const newItem = await createItem(query.trim());
			setItems((prev) => [...prev, newItem]);
			handleSelect(newItem);
			Toast.show({ type: "success", text1: `Created "${query}"` });
		} catch (e: any) {
			console.error(e);
			Toast.show({ type: "error", text1: "Failed to create item" });
		}
	};

	return (
		<ThemedView
			style={{ position: "relative", zIndex: 100, marginBottom: "12.5%" }}>
			<Autocomplete
				style={{
					color: colors.text,
					backgroundColor: colors.background,
					borderWidth: 1,
					borderColor: colors.text,
					borderRadius: 6,
				}}
				data={showResults ? filteredItems : []}
				value={query}
				onChangeText={(text) => {
					setQuery(text);
					setShowResults(true);
				}}
				placeholder="Tap to search"
				flatListProps={{
					keyExtractor: (item) => String(item[valueKey]),
					renderItem: ({ item }) => (
						<TouchableOpacity
							style={[styles.item, { backgroundColor: colors.card }]}
							onPress={() => handleSelect(item)}>
							<Text style={{ color: colors.text }}>{item[labelKey]}</Text>
						</TouchableOpacity>
					),
					keyboardShouldPersistTaps: "handled",
					style: { maxHeight: 200 },
					ListEmptyComponent:
						createItem && query.trim() && !loading ? (
							<TouchableOpacity
								style={[styles.item, { backgroundColor: colors.card }]}
								onPress={handleCreate}>
								<Text style={{ color: colors.text }}>
									Create “{query.trim()}”
								</Text>
							</TouchableOpacity>
						) : null,
				}}
				inputContainerStyle={[
					styles.inputContainer,
					{ borderColor: colors.border, backgroundColor: colors.background },
				]}
				containerStyle={[
					styles.container,
					Platform.OS === "android" ? { elevation: 10 } : { zIndex: 100 },
				]}
				listContainerStyle={[
					styles.listContainer,
					{
						borderColor: colors.border,
						backgroundColor: colors.card,
						...(Platform.OS === "android"
							? { elevation: 20 }
							: { zIndex: 9999 }),
					},
				]}
				placeholderTextColor={colors.text}
			/>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	inputContainer: {
		borderWidth: 1,
		borderRadius: 8,
	},
	item: {
		padding: 8,
		borderBottomWidth: 1,
		borderBottomColor: "#ccc",
	},
	listContainer: {
		position: "absolute",
		top: 48,
		left: 0,
		right: 0,
		borderWidth: 1,
		borderRadius: 8,
		overflow: "hidden",
	},
});
