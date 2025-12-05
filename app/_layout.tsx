import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { ThemedView } from "@/components/themed-view";

import { NetworkProvider } from "@/context/NetworkContext";
import { useColors } from "@/hooks/use-colors";
import { useToastConfig } from "@/lib/toastConfig";
import { ExtraConfig } from "@/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Constants from "expo-constants";
import { useColorScheme } from "react-native";
import Toast from "react-native-toast-message";

export default function RootLayout() {
	const queryClient = new QueryClient();
	const toastConfig = useToastConfig();

	const colorScheme = useColorScheme();
	const isDarkTheme = colorScheme === 'dark';
	const statusBarStyle = isDarkTheme ? 'light' : 'dark';
	const colors = useColors();
	const extra = Constants.expoConfig?.extra as ExtraConfig;
	const isExperimental = extra.mode === 'experiment';
	const experimentalStyles = {
		borderWidth: 5,
		borderColor: extra.color
	};

	return (
		<QueryClientProvider client={queryClient}>
			<NetworkProvider>
				<ThemedView
					style={[
						{
							flex: 1,
							backgroundColor: colors.background
						},
						isExperimental && experimentalStyles
					]}
				>
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
		</QueryClientProvider>
	);
}
