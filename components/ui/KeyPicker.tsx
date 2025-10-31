import { ThemedText } from "@/components/themed-text";
import { getMusicalKeys } from "@/constants/keys";
import { useColors } from "@/hooks/use-colors";
import { KeyPickerProps } from "@/types";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { ThemedView } from "../themed-view";

export default function KeyPicker({
	open,
	setOpen,
	label,
	value,
	onChange,
	removeKey,
	extraOptions,
}: KeyPickerProps) {
	const colors = useColors();
	const items = getMusicalKeys(colors.background, colors.text);

	const buildDropItems = () => {
		const combinedItems = extraOptions ? [...extraOptions, ...items] : items;
		const filteredItems = combinedItems.filter((i) => i.value !== removeKey);
		return filteredItems.map((i) => ({
			...i,
			// merge themed styles here
			containerStyle: {
				backgroundColor: i.value === removeKey ? colors.text : colors.background,
				...(i.containerStyle || {}),
			},
			labelStyle: {
				color: colors.text,
				...(i.labelStyle || {}),
			},
		}));
	};

	const [dropItems, setDropItems] = useState(buildDropItems);

	useEffect(() => {
		setDropItems(buildDropItems());
	}, [removeKey, items, extraOptions, colors]);

	return (
		<ThemedView style={styles.container}>
			<ThemedText>{label}</ThemedText>
			<DropDownPicker
				open={open}
				value={value}
				items={dropItems}
				setOpen={setOpen}
				setValue={(val) => {
					const actualValue = typeof val === "function" ? val(value) : val;
					onChange(actualValue as string);
				}}
				setItems={setDropItems}
				placeholder="Select key"
				style={{
					borderColor: colors.text,
					backgroundColor: colors.background,
				}}
				dropDownContainerStyle={{
					borderColor: colors.text,
					borderWidth: 0.5,
					backgroundColor: colors.background,
				}}
				labelStyle={{ color: colors.text }}
				placeholderStyle={{ color: colors.text }}
				ArrowUpIconComponent={() => (
					<MaterialIcons
						name="keyboard-arrow-up"
						size={20}
						color="white"
					/>
				)}
				ArrowDownIconComponent={() => (
					<MaterialIcons
						name="keyboard-arrow-down"
						size={20}
						color="white"
					/>
				)}
				zIndex={2000}
				zIndexInverse={1000}
			/>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
