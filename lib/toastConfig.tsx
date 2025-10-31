import { useColors } from "@/hooks/use-colors";
import React from "react";
import { BaseToast, ErrorToast } from "react-native-toast-message";

export const useToastConfig = () => {
	const colors = useColors();

	return {
		success: (props: any) => (
			<BaseToast
				{...props}
				style={{
					borderLeftColor: "#0F0",
					backgroundColor: colors.background,
					borderRadius: 10,
					paddingVertical: 10,
					borderWidth: 1,
					borderColor: colors.background,
				}}
				contentContainerStyle={{ paddingHorizontal: 12 }}
				text1Style={{
					fontSize: 15,
					fontWeight: "bold",
					color: colors.text,
				}}
			/>
		),

		error: (props: any) => (
			<ErrorToast
				{...props}
				style={{
					borderLeftColor: "#F00",
					backgroundColor: colors.background,
					borderRadius: 10,
					paddingVertical: 10,
					borderWidth: 1,
					borderColor: colors.background,
				}}
				text1Style={{
					fontSize: 15,
					fontWeight: "bold",
					color: colors.text,
				}}
			/>
		),
	};
};
