import { Stack } from "expo-router";
import "react-native-reanimated";

import { NetworkProvider } from "@/context/NetworkContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { TabletProvider } from "@/context/TabletContext";
import { useColors } from "@/hooks/use-colors";
import { useDevice } from "@/hooks/use-device";
import { useToastConfig } from "@/lib/toastConfig";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useColorScheme } from "react-native";
import { SystemBars } from "react-native-edge-to-edge";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const queryClient = new QueryClient();

export default function RootLayout() {
	const toastConfig = useToastConfig();
	const colorScheme = useColorScheme();
	const { isTablet } = useDevice();
	const isDarkTheme = colorScheme === "dark";
	const statusBarStyle = isDarkTheme ? "light" : "dark";
	const colors = useColors();
	const bottom = isTablet ? "off" : "additive";

	return (
		<QueryClientProvider client={queryClient}>
			<SettingsProvider>
				<NetworkProvider>
					<TabletProvider>
						<SafeAreaProvider>
							<SafeAreaView
								edges={{ bottom }}
								style={[
									{
										flex: 1,
										backgroundColor: colors.background,
									},
								]}>
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
								<SystemBars style={statusBarStyle} />
							</SafeAreaView>
							<Toast config={toastConfig} />
						</SafeAreaProvider>
					</TabletProvider>
				</NetworkProvider>
				z
			</SettingsProvider>
		</QueryClientProvider>
	);
}
