import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Link, Tabs } from "expo-router";
import React from "react";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import { TouchableOpacity } from "react-native";

import { isAdmin } from "@/lib/supabase";
import { generateHref } from "@/utils/paramUtils";

export default function TabLayout() {
	const colorScheme = useColorScheme();
	const currentTheme = Colors[colorScheme ?? "light"];

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: currentTheme.tint,
				tabBarInactiveTintColor: currentTheme.inactiveTint,
				tabBarButton: (props: BottomTabBarButtonProps) => (
					<PlatformPressable
						{...props}
						onPressIn={props.onPressIn}
					/>
				),
			}}>
			<Tabs.Screen
				name="shows"
				options={{
					title: "Shows",
					headerRight: () =>
						isAdmin && (
							<Link
								href={generateHref("editShow", {})}
								asChild>
								<TouchableOpacity>
									<MaterialIcons
										color={currentTheme.text}
										size={28}
										name="add"
										style={{ marginRight: "2.5%" }}
									/>
								</TouchableOpacity>
							</Link>
						),
					tabBarIcon: ({ color }) => (
						<MaterialIcons
							size={24}
							color={color}
							name="library-music"
						/>
					),
					tabBarLabelStyle: {
						fontSize: 15,
					},
				}}
			/>
			<Tabs.Screen
				name="songs"
				options={{
					title: "Songs",
					headerRight: () =>
						isAdmin && (
							<Link
								href={generateHref("editSong", {})}
								asChild>
								<TouchableOpacity>
									<MaterialIcons
										color={currentTheme.text}
										size={28}
										name="add"
										style={{ marginRight: "2.5%" }}
									/>
								</TouchableOpacity>
							</Link>
						),
					tabBarIcon: ({ color }) => (
						<MaterialIcons
							color={color}
							size={24}
							name="music-note"
						/>
					),
					tabBarLabelStyle: {
						fontSize: 15,
					},
				}}
			/>
		</Tabs>
	);
}
