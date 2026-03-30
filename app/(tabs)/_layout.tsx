import { useColors } from "@/hooks/use-colors";
import { useDevice } from "@/hooks/use-device";
import { isAdmin } from "@/lib/supabase";
import { generateHref } from "@/utils/paramUtils";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Link, Tabs } from "expo-router";
import React from "react";

import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import { TouchableOpacity } from "react-native";

import ShowDetailScreen from "@/app/show/[id]";
import SongDetailScreen from "@/app/song/[id]";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTablet } from "@/context/TabletContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
	const insets = useSafeAreaInsets();
	const colors = useColors();
	const { isTablet } = useDevice();
	const { selectedId, selectedType, selectedMeta, clearSelected } = useTablet();

	const tabStyle = {
		tabBarLabelStyle: { fontSize: 15 },
		headerStyle: { backgroundColor: colors.background },
		headerTitleStyle: { color: colors.text },
	};

	const tabs = (
		<Tabs
			initialRouteName="shows"
			screenOptions={{
				tabBarActiveTintColor: colors.accent,
				tabBarButton: (props: BottomTabBarButtonProps) => (
					<PlatformPressable
						{...props}
						onPressIn={props.onPressIn}
					/>
				),
				tabBarStyle: {
					backgroundColor: colors.background,
				},
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
							name="queue-play-next"
						/>
					),
					...tabStyle,
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
					...tabStyle,
				}}
			/>
			<Tabs.Screen
				name="stats"
				options={{
					title: "Stats",
					href: isAdmin ? "/(tabs)/stats" : null,
					tabBarIcon: ({ color }) => (
						<MaterialIcons
							color={color}
							size={24}
							name="leaderboard"
						/>
					),
					...tabStyle,
				}}
			/>
			<Tabs.Screen
				name="admin"
				options={{
					title: "Admin",
					href: isAdmin ? "/(tabs)/admin" : null,
					tabBarIcon: ({ color }) => (
						<MaterialIcons
							color={color}
							size={24}
							name="admin-panel-settings"
						/>
					),
					...tabStyle,
				}}
			/>
		</Tabs>
	);

	if (!isTablet) return tabs;

	const renderRightPanelHeader = () => {
		if (!selectedId || !selectedType) return null;

		return (
			<ThemedView
				style={{
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-between",
					padding: "1.5%",
					borderBottomWidth: 1,
					borderBottomColor: colors.placeholder,
					backgroundColor: colors.background,
				}}>
				<ThemedView
					style={{
						flexDirection: "row",
						gap: 10,
					}}>
					<ThemedText
						style={{ fontSize: 22, fontWeight: "bold", color: colors.text }}>
						{selectedMeta?.title ?? "Details"}
					</ThemedText>
				</ThemedView>
				<ThemedView
					style={{
						flexDirection: "row",
						gap: 8,
						backgroundColor: "transparent",
					}}>
					<Link
						href={generateHref(
							selectedType === "song" ? "editSong" : "editShow",
							{ id: selectedId },
						)}
						asChild>
						<TouchableOpacity>
							<MaterialIcons
								size={24}
								name="edit"
								color={colors.text}
							/>
						</TouchableOpacity>
					</Link>
					<TouchableOpacity onPress={clearSelected}>
						<MaterialIcons
							size={24}
							name="close"
							color={colors.text}
						/>
					</TouchableOpacity>
				</ThemedView>
			</ThemedView>
		);
	};

	const renderRightPanel = () => {
		if (!selectedId || !selectedType) {
			return (
				<ThemedView
					style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
					<MaterialIcons
						color={colors.placeholder}
						size={60}
						name="touch-app"
					/>
					<ThemedText
						style={{ color: colors.placeholder, marginTop: 8, fontSize: 28 }}>
						Select an item to view details
					</ThemedText>
				</ThemedView>
			);
		}

		return (
			<ThemedView style={{ flex: 1, gap: "1.5%" }}>
				{renderRightPanelHeader()}
				{selectedType === "song" && <SongDetailScreen />}
				{selectedType === "show" && <ShowDetailScreen />}
			</ThemedView>
		);
	};

	return (
		<ThemedView style={{ flex: 1, flexDirection: "row" }}>
			<ThemedView
				style={{
					width: "25%",
					borderRightWidth: 1,
					borderRightColor: colors.placeholder,
				}}>
				{tabs}
			</ThemedView>
			<ThemedView style={{ width: "75%", paddingTop: insets.top }}>
				{renderRightPanel()}
			</ThemedView>
		</ThemedView>
	);
}
