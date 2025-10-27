import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { BaseToast, ErrorToast } from "react-native-toast-message";

export const useToastConfig = () => {
	const colorScheme = useColorScheme();
	const currentTheme = Colors[colorScheme ?? "light"];

	return {
		success: (props: any) => (
			<BaseToast
				{...props}
				style={{
					borderLeftColor: "#0F0",
					backgroundColor: currentTheme.background,
					borderRadius: 10,
					paddingVertical: 10,
					borderWidth: 1,
					borderColor: currentTheme.inactiveTint,
				}}
				contentContainerStyle={{ paddingHorizontal: 12 }}
				text1Style={{
					fontSize: 15,
					fontWeight: "bold",
					color: currentTheme.text,
				}}
			/>
		),

		error: (props: any) => (
			<ErrorToast
				{...props}
				style={{
					borderLeftColor: "#F00",
					backgroundColor: currentTheme.background,
					borderRadius: 10,
					paddingVertical: 10,
					borderWidth: 1,
					borderColor: currentTheme.inactiveTint,
				}}
				text1Style={{
					fontSize: 15,
					fontWeight: "bold",
					color: currentTheme.text,
				}}
			/>
		),
	};
};
