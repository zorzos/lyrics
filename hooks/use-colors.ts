import { useColorScheme } from "react-native";

export const lightColors = {
    text: "#11181C",
    background: "#ECEDEE",
    tint: "#0a7ea4",
    link: "#0a7ea4",
    buttonBg: "#007AFF",
    buttonText: "#FFFFFF",
};

export const darkColors = {
    text: "#ECEDEE",
    background: "#151718",
    tint: "#fff",
    link: "#0A84FF",
    buttonBg: "#0A84FF",
    buttonText: "#FFFFFF",
};

export const useColors = () => {
    const scheme = useColorScheme();
    return scheme === "dark" ? darkColors : lightColors;
};
