import { useColors } from "@/hooks/use-colors";
import React, { useEffect, useState } from "react";
import {
	FlatList,
	Keyboard,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from "react-native";
import Toast from "react-native-toast-message";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";

type NewItem = { isNew: true; name: string };
type Selectable<T> = T | NewItem;

interface AutocompleteInputProps<T> {
	value: Selectable<T>[];
	onChange: (items: Selectable<T>[]) => void;
	fetchData: () => Promise<T[]>;
	labelKey: keyof T;
	valueKey: keyof T;
	createItem?: (name: string) => Promise<T>;
	placeholder?: string;
}

export default function AutocompleteInput<T extends Record<string, any>>({
	value = [],
	onChange,
	fetchData,
	labelKey,
	valueKey,
	createItem,
	placeholder = "Tap to lookup/create items",
}: AutocompleteInputProps<T>) {
	const colors = useColors();

	const [items, setItems] = useState<T[]>([]);
	const [query, setQuery] = useState("");
	const [filteredItems, setFilteredItems] = useState<T[]>([]);
	const [loading, setLoading] = useState(false);
	const [showResults, setShowResults] = useState(false);

	// fetch items on mount
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

	// filter results excluding already selected items
	useEffect(() => {
		const q = query.trim().toLowerCase();
		if (!q) {
			setFilteredItems([]);
			return;
		}

		const filtered = items.filter(
			(i) =>
				String(i[labelKey]).toLowerCase().includes(q) &&
				!value.some((v) => !("isNew" in v) && v[valueKey] === i[valueKey])
		);
		setFilteredItems(filtered);
	}, [query, items, value, labelKey, valueKey]);

	const handleSelect = (item: T) => {
		if (!value.some((v) => !("isNew" in v) && v[valueKey] === item[valueKey])) {
			onChange([...value, item]);
		}
		setQuery("");
		setFilteredItems([]);
		setShowResults(false);
		Keyboard.dismiss();
	};

	const handleCreateSelect = () => {
		const newItem: NewItem = { isNew: true, name: query.trim() };

		const exists = value.some(
			(v) =>
				("isNew" in v && v.name.toLowerCase() === newItem.name.toLowerCase()) ||
				(!("isNew" in v) &&
					String(v[labelKey]).toLowerCase() === newItem.name.toLowerCase())
		);

		if (!exists) {
			onChange([...value, newItem]);
		}

		setQuery("");
		setFilteredItems([]);
		setShowResults(false);
		Keyboard.dismiss();
	};

	const removeSelected = (index: number) => {
		const updated = [...value];
		updated.splice(index, 1);
		onChange(updated);
	};

	const renderItem = ({ item }: { item: T }) => (
		<TouchableOpacity
			style={[styles.item, { backgroundColor: colors.background }]}
			onPress={() => handleSelect(item)}
		>
			<ThemedText>{item[labelKey]}</ThemedText>
		</TouchableOpacity>
	);

	const showCreateOption =
		createItem &&
		query.trim() &&
		!loading &&
		!items.some(
			(i) =>
				String(i[labelKey]).toLowerCase() === query.trim().toLowerCase()
		) &&
		!value.some((v) =>
			"isNew" in v
				? v.name.toLowerCase() === query.trim().toLowerCase()
				: String(v[labelKey]).toLowerCase() === query.trim().toLowerCase()
		);

	return (
		<ThemedView style={{ position: "relative", zIndex: 9999 }}>
			{/* Selected chips */}
			<View style={styles.chipsContainer}>
				{value.map((v, idx) => (
					<TouchableOpacity
						key={idx}
						style={[styles.chip, { backgroundColor: colors.tint }]}
						onPress={() => removeSelected(idx)}
					>
						<Text style={{ color: "#fff" }}>
							{"isNew" in v ? v.name : String(v[labelKey])} ✕
						</Text>
					</TouchableOpacity>
				))}
			</View>

			<TextInput
				value={query}
				onChangeText={(text) => setQuery(text)}
				onFocus={() => setShowResults(true)}
				placeholder={placeholder}
				placeholderTextColor="lightgray"
				style={[
					styles.input,
					{ color: colors.text, borderColor: colors.text, backgroundColor: colors.background },
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
							zIndex: 9999,
						},
					]}
				>
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
									onPress={handleCreateSelect}
								>
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
		padding: 8,
		marginBottom: 8,
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
	chipsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
		marginBottom: 4,
	},
	chip: {
		borderRadius: 16,
		paddingVertical: 4,
		paddingHorizontal: 8,
		margin: 2,
	},
});
