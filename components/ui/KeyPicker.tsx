import { ThemedText } from "@/components/themed-text";
import { getMusicalKeys } from "@/constants/keys";
import { useColors } from "@/hooks/use-colors";
import { KeyPickerProps } from "@/types";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { ThemedView } from "../themed-view";

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default function KeyPicker({
	open,
	setOpen,
	label,
	value,
	onChange,
	removeKey,
	extraOptions,
	zIndex,
	zIndexInverse,
}: KeyPickerProps) {
	const colors = useColors();
	const items = getMusicalKeys(colors.background, colors.text);

	const dropItems = useMemo(() => {
		const combinedItems = extraOptions ? [...extraOptions, ...items] : items;

		return combinedItems
			.filter((i) => i.value !== removeKey)
			.map((i) => ({
				...i,
				containerStyle: {
					backgroundColor:
						i.value === removeKey ? colors.text : colors.background,
					...(i.containerStyle || {}),
				},
				labelStyle: {
					color: colors.text,
					...(i.labelStyle || {}),
				},
			}));
	}, [removeKey, items, extraOptions, colors]);

	return (
		<ThemedView style={[styles.container, { overflow: "visible" }]}>
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
				placeholderStyle={{ color: colors.placeholder }}
				ArrowUpIconComponent={() => (
					<MaterialIcons
						name="keyboard-arrow-up"
						size={20}
						color={colors.text}
					/>
				)}
				ArrowDownIconComponent={() => (
					<MaterialIcons
						name="keyboard-arrow-down"
						size={20}
						color={colors.text}
					/>
				)}
				zIndex={zIndex}
				zIndexInverse={zIndexInverse}
				listMode="SCROLLVIEW"
				maxHeight={200} // ensures scrollable height
				scrollViewProps={{ nestedScrollEnabled: true }}
			/>
		</ThemedView>
	);
}
