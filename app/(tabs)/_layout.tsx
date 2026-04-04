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
import ShowEditScreen from "@/app/show/edit";
import SongDetailScreen from "@/app/song/[id]";
import SongEditScreen from "@/app/song/edit";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTablet } from "@/context/TabletContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
	const insets = useSafeAreaInsets();
	const colors = useColors();
	const { isTablet } = useDevice();
	const {
		selectedId,
		selectedType,
		selectedMeta,
		clearSelected,
		isEditing,
		isAdding,
		setIsEditing,
		setIsAdding,
	} = useTablet();

	const tabStyle = {
		tabBarLabelStyle: { fontSize: 15 },
		headerStyle: { backgroundColor: colors.background },
		headerTitleStyle: { color: colors.text },
		tabBarItemStyle: {
			borderRightWidth: 0.5,
			borderRightColor: colors.placeholder,
			marginVertical: 8,
		},
	};

	const lastTabStyle = {
		...tabStyle,
		tabBarItemStyle: { marginVertical: 8 },
	};

	const AddButton = ({ type }: { type: "song" | "show" }) => {
		if (!isAdmin) return null;

		if (isTablet) {
			return (
				<TouchableOpacity
					style={{ marginRight: "2.5%" }}
					onPress={() => setIsAdding(true, type)}>
					<MaterialIcons
						color={colors.text}
						size={28}
						name="add"
					/>
				</TouchableOpacity>
			);
		}

		return (
			<Link
				href={generateHref(type === "song" ? "editSong" : "editShow", {})}
				asChild>
				<TouchableOpacity style={{ marginRight: "2.5%" }}>
					<MaterialIcons
						color={colors.text}
						size={28}
						name="add"
					/>
				</TouchableOpacity>
			</Link>
		);
	};

	const tabs = (
		<Tabs
			initialRouteName="shows"
			screenOptions={{
				tabBarActiveTintColor: colors.tint,
				tabBarInactiveTintColor: colors.placeholder,
				tabBarButton: (props: BottomTabBarButtonProps) => (
					<PlatformPressable
						{...props}
						onPressIn={props.onPressIn}
					/>
				),
				tabBarStyle: { backgroundColor: colors.background },
			}}>
			<Tabs.Screen
				name="shows"
				options={{
					title: "Shows",
					headerRight: () => <AddButton type="show" />,
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
					headerRight: () => <AddButton type="song" />,
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
					...lastTabStyle,
				}}
			/>
		</Tabs>
	);

	if (!isTablet) return tabs;

	const renderRightPanelHeader = () => {
		if (!selectedId && !isAdding && !isEditing) return null;

		const title = isAdding
			? `New ${selectedType === "song" ? "Song" : "Show"}`
			: isEditing
				? `Edit ${selectedType === "song" ? "Song" : "Show"}`
				: (selectedMeta?.title ?? "Details");

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
				<ThemedText
					style={{ fontSize: 22, fontWeight: "bold", color: colors.text }}>
					{title}
				</ThemedText>
				<ThemedView
					style={{
						flexDirection: "row",
						gap: 12,
						backgroundColor: "transparent",
					}}>
					{isEditing || isAdding ? (
						<TouchableOpacity
							onPress={() => {
								setIsEditing(false);
								setIsAdding(false);
							}}>
							<MaterialIcons
								size={24}
								name="close"
								color={colors.text}
							/>
						</TouchableOpacity>
					) : (
						<>
							{isAdmin && (
								<TouchableOpacity onPress={() => setIsEditing(true)}>
									<MaterialIcons
										size={24}
										name="edit"
										color={colors.text}
									/>
								</TouchableOpacity>
							)}
							<TouchableOpacity onPress={clearSelected}>
								<MaterialIcons
									size={24}
									name="close"
									color={colors.text}
								/>
							</TouchableOpacity>
						</>
					)}
				</ThemedView>
			</ThemedView>
		);
	};

	const renderRightPanel = () => {
		if (!selectedId && !isAdding) {
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
			<ThemedView style={{ flex: 1 }}>
				{renderRightPanelHeader()}
				{isAdding || isEditing ? (
					selectedType === "song" ? (
						<SongEditScreen />
					) : (
						<ShowEditScreen />
					)
				) : selectedType === "song" ? (
					<SongDetailScreen />
				) : (
					<ShowDetailScreen />
				)}
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
