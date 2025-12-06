import { ColorTheme, useColors } from "@/hooks/use-colors";
import { AutocompleteItem, AutocompleteProps } from "@/types";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useMemo, useState } from "react";
import {
	FlatList,
	Keyboard,
	StyleSheet,
	TextInput,
	TouchableOpacity,
} from "react-native";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";

const createStyles = (colors: ColorTheme) =>
	StyleSheet.create({
		chipsContainer: {
			flexDirection: "row",
			flexWrap: "wrap",
			gap: 8,
			marginBottom: 4,
		},
		chip: {
			paddingHorizontal: 8,
			paddingVertical: 2,
			borderRadius: 20,
			flexDirection: "row",
			alignItems: "center",
			borderWidth: 1,
			gap: 4,
			backgroundColor: colors.background,
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
			backgroundColor: colors.background,
		},
	});

export default function AutocompleteInput({
	value,
	onChange,
	data,
	placeholder = "Select artist",
}: AutocompleteProps) {
	const colors = useColors();
	const styles = createStyles(colors);
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
				id: `new-${Date.now() * Math.random()}`,
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
			<ThemedView style={styles.chipsContainer}>
				{value.map((item) => (
					<ThemedView
						key={item.id}
						style={{
							...styles.chip,
							borderColor: item.isNew ? colors.accent : colors.placeholder,
						}}>
						<ThemedText style={{ color: colors.text }}>{item.label}</ThemedText>
						<TouchableOpacity onPress={() => removeItem(item.id)}>
							<MaterialIcons
								color={colors.text}
								name="close"
								size={16}
							/>
						</TouchableOpacity>
					</ThemedView>
				))}
			</ThemedView>

			<ThemedView style={{ position: "relative" }}>
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

				{query.length > 0 ? (
					<TouchableOpacity
						style={{
							position: "absolute",
							right: "1.5%",
							top: 0,
							bottom: 0,
							justifyContent: "center",
							padding: "1%",
						}}
						onPress={() => setQuery("")}>
						<MaterialIcons
							name="close"
							size={20}
							color={colors.text}
						/>
					</TouchableOpacity>
				) : (
					<MaterialIcons
						color={colors.text}
						name="keyboard-arrow-down"
						size={20}
						style={{
							position: "absolute",
							right: "2%",
							top: "20%",
							alignItems: "center",
						}}
					/>
				)}
			</ThemedView>

			{/* Dropdown + overlay */}
			{showDropdown && (
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
								style={styles.item}
								onPress={() => handleSelect(item)}>
								<ThemedText style={{ color: colors.text }}>
									{item.isNew ? `Create "${item.label}"` : item.label}
								</ThemedText>
							</TouchableOpacity>
						)}
						ListEmptyComponent={() => (
							<ThemedText
								style={{
									color: colors.placeholder,
									textAlign: "center",
									paddingVertical: 6,
								}}>
								There are no artists left!
							</ThemedText>
						)}
					/>
				</>
			)}
		</ThemedView>
	);
}
