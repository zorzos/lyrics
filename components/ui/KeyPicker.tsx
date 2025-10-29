import { ThemedText } from "@/components/themed-text";
import { getMusicalKeys } from "@/constants/keys";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MusicalKey } from "@/types";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTheme } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { ThemedView } from "../themed-view";

interface KeyPickerProps {
    label: string;
    value: string;
    onChange: (val: string) => void;
    items?: MusicalKey;
    disabledKey?: string; // e.g., original key for SP key
    extraOptions?: {
        label: string;
        value: string;
        containerStyle?: object;
        labelStyle?: object;
    }[];
}

export default function KeyPicker({
    label,
    value,
    onChange,
    disabledKey,
    extraOptions
}: KeyPickerProps) {
    const { colors } = useTheme();
    const colorScheme = useColorScheme();
    const currentTheme = Colors[colorScheme ?? "light"];
    const [open, setOpen] = useState(false);
    const items = getMusicalKeys(currentTheme.background, currentTheme.text);

    const buildDropItems = () => {
        const combinedItems = extraOptions ? [...extraOptions, ...items] : items;
        return combinedItems.map((i) => ({
            ...i,
            disabled: i.value === disabledKey,
            // merge themed styles here
            containerStyle: {
                backgroundColor: i.value === disabledKey ? colors.border : colors.card,
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
    }, [disabledKey, items, extraOptions, colors]);

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
