import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Link, Tabs } from "expo-router";
import React from "react";

import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import { TouchableOpacity } from "react-native";

import { useColors } from "@/hooks/use-colors";
import { isAdmin } from "@/lib/supabase";
import { ExtraConfig } from "@/types";
import { generateHref } from "@/utils/paramUtils";
import Constants from "expo-constants";

export default function TabLayout() {
	const colors = useColors();
	const { mode } = Constants.expoConfig?.extra as ExtraConfig;
	console.log('MODE', mode);

	const tabStyle = {
		tabBarLabelStyle: {
			fontSize: 15,
		},
		headerStyle: {
			backgroundColor: colors.background
		},
		headerTitleStyle: {
			color: colors.text
		}
	};

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: colors.tint,
				tabBarInactiveTintColor: "#999",
				tabBarButton: (props: BottomTabBarButtonProps) => (
					<PlatformPressable
						{...props}
						onPressIn={props.onPressIn}
					/>
				),
				tabBarStyle: {
					backgroundColor: colors.background
				}
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
										color={colors.text}
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
					...tabStyle
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
										color={colors.text}
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
					...tabStyle
				}}
			/>
			<Tabs.Screen
				name="admin"
				options={{
					title: "Admin",
					href: isAdmin ? "/(tabs)/admin" : null,
					headerRight: () =>
						isAdmin && (
							<Link
								href={generateHref("editSong", {})}
								asChild>
								<TouchableOpacity>
									<MaterialIcons
										color={colors.text}
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
							name="admin-panel-settings"
						/>
					),
					...tabStyle
				}}
			/>
		</Tabs>
	);
}
