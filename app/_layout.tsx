import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { ThemedView } from "@/components/themed-view";

import { NetworkProvider } from "@/context/NetworkContext";
import { TagProvider } from "@/context/TagContext";
import { useColors } from "@/hooks/use-colors";
import { useToastConfig } from "@/lib/toastConfig";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useColorScheme } from "react-native";
import Toast from "react-native-toast-message";

export default function RootLayout() {
	const queryClient = new QueryClient();
	const toastConfig = useToastConfig();

	const colorScheme = useColorScheme();
	const isDarkTheme = colorScheme === 'dark';
	const statusBarStyle = isDarkTheme ? 'light' : 'dark';
	const colors = useColors();

	return (
		<QueryClientProvider client={queryClient}>
			<TagProvider>
				<NetworkProvider>
					<ThemedView
						style={{ flex: 1, backgroundColor: colors.background }}>
						<Stack
							screenOptions={{
								animation: "slide_from_right",
								contentStyle: { backgroundColor: colors.background },
								headerStyle: { backgroundColor: colors.background },
								headerTintColor: colors.text,
							}}>
							<Stack.Screen
								name="(tabs)"
								options={{ headerShown: false }}
							/>
						</Stack>
						<StatusBar style={statusBarStyle} />
					</ThemedView>
					<Toast config={toastConfig} />
				</NetworkProvider>
			</TagProvider>
		</QueryClientProvider>
	);
}
