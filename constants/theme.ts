import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { Platform } from "react-native";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
	light: {
		text: "#11181C",
		background: "#ECEDEE",
		tint: tintColorLight,
		inactiveTint: "#d2d5d8ab",
		icon: "#687076",
		tabIconDefault: "#687076",
		tabIconSelected: tintColorLight,
		borderColor: "#D0D0D0",
	},
	dark: {
		text: "#ECEDEE",
		background: "#151718",
		tint: tintColorDark,
		inactiveTint: "#d2d5d8ab",
		icon: "#9BA1A6",
		tabIconDefault: "#9BA1A6",
		tabIconSelected: tintColorDark,
		borderColor: "#333333",
	},
};

export const Fonts = Platform.select({
	ios: {
		sans: "system-ui",
		serif: "ui-serif",
		rounded: "ui-rounded",
		mono: "ui-monospace",
	},
	default: {
		sans: "normal",
		serif: "serif",
		rounded: "normal",
		mono: "monospace",
	},
	web: {
		sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
		serif: "Georgia, 'Times New Roman', serif",
		rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
		mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
	},
});

export const LightTheme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		text: Colors.light.text,
		background: Colors.light.background,
		primary: Colors.light.tint,
		card: Colors.light.background,
		border: Colors.light.borderColor,
		notification: Colors.light.tint,
	},
};

export const DarkAppTheme = {
	...DarkTheme,
	colors: {
		...DarkTheme.colors,
		text: Colors.dark.text,
		background: Colors.dark.background,
		primary: Colors.dark.tint,
		card: Colors.dark.background,
		border: Colors.dark.borderColor,
		notification: Colors.dark.tint,
	},
};
