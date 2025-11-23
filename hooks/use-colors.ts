import { useColorScheme } from "react-native";

export interface ColorTheme {
	text: string;
	background: string;
	tint: string;
	link: string;
	buttonBg: string;
	buttonText: string;
	placeholder: string;
}

const common = {
	accent: "#DA291C",
};

export const lightColors: ColorTheme = {
	...common,
	text: "#11181C",
	background: "#ECEDEE",
	tint: "#0a7ea4",
	link: "#0a7ea4",
	buttonBg: "#007AFF",
	buttonText: "#FFFFFF",
	placeholder: "darkgray",
};

export const darkColors: ColorTheme = {
	...common,
	text: "#ECEDEE",
	background: "#151718",
	tint: "#fff",
	link: "#0A84FF",
	buttonBg: "#0A84FF",
	buttonText: "#FFFFFF",
	placeholder: "#999",
};

export const useColors = () => {
	const scheme = useColorScheme();
	return scheme === "dark" ? darkColors : lightColors;
};
