import { useColors } from "@/hooks/use-colors";
import { AutocompleteItem, AutocompleteProps } from "@/types";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useMemo, useState } from "react";
import {
	FlatList,
	Keyboard,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { ThemedView } from "../themed-view";

export default function AutocompleteInput({
	value,
	onChange,
	data,
	placeholder = "Select artist",
}: AutocompleteProps) {
	const colors = useColors();
	const [query, setQuery] = useState("");
	const [showDropdown, setShowDropdown] = useState(false);

	// --- Hide dropdown when keyboard is dismissed
	useEffect(() => {
		const hideListener = Keyboard.addListener("keyboardDidHide", () => {
			setShowDropdown(false);
		});
		return () => hideListener.remove();
	}, []);

	// --- Filter options and append "create new" if needed
	const filteredOptions = useMemo(() => {
		const selectedIds = new Set(value.map((i) => i.id));
		const filtered = data
			.filter((i) => !selectedIds.has(i.id))
			.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()))
			.sort((a, b) =>
				a.label.toLowerCase().localeCompare(b.label.toLowerCase())
			);

		if (
			query.trim() &&
			!filtered.some(
				(i) => i.label.toLowerCase() === query.trim().toLowerCase()
			)
		) {
			filtered.push({
				id: `new-${Date.now()}`,
				label: query.trim(),
				isNew: true,
			});
		}

		return filtered;
	}, [value, data, query]);

	const handleSelect = (item: AutocompleteItem) => {
		onChange([...value, item]);
		setQuery("");
		setShowDropdown(false);
		Keyboard.dismiss();
	};

	const removeItem = (id: string) => {
		onChange(value.filter((i) => i.id !== id));
	};

	return (
		<ThemedView>
			{/* Chips */}
			<View style={styles.chipsContainer}>
				{value.map((item) => (
					<View
						key={item.id}
						style={{
							...styles.chip,
							backgroundColor: item.isNew ? colors.accent : colors.background,
							borderColor: colors.placeholder,
						}}>
						<Text style={{ color: colors.text }}>{item.label}</Text>
						<TouchableOpacity onPress={() => removeItem(item.id)}>
							<MaterialIcons
								color={colors.text}
								name="close"
								size={16}
							/>
						</TouchableOpacity>
					</View>
				))}
			</View>

			{/* Search input with clear button */}
			<View style={{ position: "relative" }}>
				<TextInput
					value={query}
					onChangeText={(text) => {
						setQuery(text);
						setShowDropdown(true);
					}}
					onFocus={() => setShowDropdown(true)}
					placeholder={placeholder}
					placeholderTextColor={colors.placeholder}
					style={{
						...styles.input,
						borderColor: colors.text,
						color: colors.text,
						backgroundColor: colors.background,
						paddingRight: 30,
					}}
				/>

				{query.length > 0 && (
					<TouchableOpacity
						style={{
							position: "absolute",
							right: 6,
							top: 0,
							bottom: 0,
							justifyContent: "center",
							padding: 4,
						}}
						onPress={() => setQuery("")}>
						<MaterialIcons
							name="close"
							size={20}
							color={colors.text}
						/>
					</TouchableOpacity>
				)}
			</View>

			{/* Dropdown + overlay */}
			{showDropdown && filteredOptions.length > 0 && (
				<>
					{/* Full-screen overlay to catch taps outside */}
					<TouchableOpacity
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							zIndex: 1,
						}}
						activeOpacity={1}
						onPress={() => setShowDropdown(false)}
					/>

					{/* Dropdown list */}
					<FlatList
						data={filteredOptions}
						keyExtractor={(item) => item.id}
						style={{
							...styles.dropdown,
							backgroundColor: colors.background,
							borderColor: colors.text,
							zIndex: 2,
						}}
						keyboardShouldPersistTaps="handled"
						renderItem={({ item }) => (
							<TouchableOpacity
								style={{
									...styles.item,
									backgroundColor: colors.background,
								}}
								onPress={() => handleSelect(item)}>
								<Text style={{ color: colors.text }}>
									{item.isNew ? `Create "${item.label}"` : item.label}
								</Text>
							</TouchableOpacity>
						)}
					/>
				</>
			)}
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	chipsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
		marginBottom: 4,
	},
	chip: {
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 20,
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1,
		gap: 4,
		marginRight: 6,
		marginBottom: 6,
	},
	input: {
		borderWidth: 1,
		borderRadius: 4,
		padding: 6,
		fontSize: 16,
		marginBottom: 4,
	},
	dropdown: {
		borderWidth: 1,
		borderRadius: 4,
		maxHeight: 200,
	},
	item: {
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: "#ccc",
	},
});
