import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";

import { TagProvider } from "@/context/TagContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Toast from "react-native-toast-message";
const queryClient = new QueryClient();

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const theme = colorScheme === "dark" ? DarkTheme : DefaultTheme;

	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider value={theme}>
				<TagProvider>
					<ThemedView
						style={{ flex: 1, backgroundColor: theme.colors.background }}>
						<Stack
							screenOptions={{
								animation: "slide_from_right",
								contentStyle: { backgroundColor: "transparent" },
								headerStyle: { backgroundColor: theme.colors.card },
								headerTintColor: theme.colors.text,
							}}>
							<Stack.Screen
								name="(tabs)"
								options={{ headerShown: false }}
							/>
						</Stack>
						<StatusBar style="auto" />
					</ThemedView>
					<Toast />
				</TagProvider>
			</ThemeProvider>
		</QueryClientProvider>
	);
}
