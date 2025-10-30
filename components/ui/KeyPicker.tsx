import { ThemedText } from "@/components/themed-text";
import { getMusicalKeys } from "@/constants/keys";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { KeyPickerProps } from "@/types";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTheme } from "@react-navigation/native";
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
    extraOptions
}: KeyPickerProps) {
    const { colors } = useTheme();
    const colorScheme = useColorScheme();
    const currentTheme = Colors[colorScheme ?? "light"];
    const items = getMusicalKeys(currentTheme.background, currentTheme.text);

    const buildDropItems = () => {
        const combinedItems = extraOptions ? [...extraOptions, ...items] : items;
        const filteredItems = combinedItems.filter((i) => i.value !== removeKey);
        return filteredItems.map((i) => ({
            ...i,
            // merge themed styles here
            containerStyle: {
                backgroundColor: i.value === removeKey ? colors.border : colors.card,
                ...(i.containerStyle || {}),
            },
            labelStyle: {
                color: currentTheme.text,
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
                    borderColor: currentTheme.icon,
                    backgroundColor: currentTheme.background,
                }}
                dropDownContainerStyle={{
                    borderColor: currentTheme.icon,
                    borderWidth: 0.5,
                    backgroundColor: currentTheme.background,
                }}
                labelStyle={{ color: currentTheme.text }}
                placeholderStyle={{ color: currentTheme.text }}
                ArrowUpIconComponent={() =>
                    <MaterialIcons
                        name="keyboard-arrow-up"
                        size={20}
                        color="white"
                    />
                }
                ArrowDownIconComponent={() =>
                    <MaterialIcons
                        name="keyboard-arrow-down"
                        size={20}
                        color="white"
                    />
                }
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginRight: 8,
    },
});
