import {
	ActivityIndicator,
	SectionList,
	StyleSheet,
	TouchableOpacity,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { useTablet } from "@/context/TabletContext";
import { ColorTheme, useColors } from "@/hooks/use-colors";
import { useDevice } from "@/hooks/use-device";
import { useShows } from "@/hooks/useShows";
import { Show } from "@/types";
import { formatDate } from "@/utils/dateUtils";
import { generateHref } from "@/utils/paramUtils";
import { categoriseShows } from "@/utils/showUtils";
import { Link, useFocusEffect } from "expo-router";
import { useCallback } from "react";

const createStyles = (colors: ColorTheme) =>
	StyleSheet.create({
		container: { flex: 1, paddingHorizontal: "2.5%", paddingTop: "1%" },
		item: {
			padding: 12,
		},
		text: {
			fontSize: 16,
			color: colors.text,
		},
		errorView: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			backgroundColor: colors.background,
		},
	});

export default function Shows() {
	const colors = useColors();
	const styles = createStyles(colors);
	const { isTablet } = useDevice();
	const { selectedId, setSelected, clearSelected } = useTablet();
	const { data: shows, isLoading, isError } = useShows();

	useFocusEffect(useCallback(() => clearSelected, [clearSelected]));

	if (isLoading) {
		return (
			<ThemedView style={styles.errorView}>
				<ActivityIndicator
					size="large"
					color={colors.text}
				/>
			</ThemedView>
		);
	}

	if (isError || !shows) {
		return (
			<ThemedView
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
					padding: 16,
					backgroundColor: colors.background,
				}}>
				<ThemedText style={styles.text}>Error loading shows</ThemedText>
			</ThemedView>
		);
	}

	const sections = categoriseShows(shows).filter(
		(section) => section.data.length > 0,
	);

	const renderItem = ({ item }: { item: Show }) => {
		const label = `${item.title.substring(0, 15)} ${formatDate(new Date(item.date))}`;
		const isSelected = item.id === selectedId;
		const selectedStyle = isSelected && {
			borderColor: colors.accent,
			borderWidth: 1,
			borderRadius: 20,
			borderBottomColor: colors.accent,
			borderBottomWidth: 1,
			backgroundColor: `${colors.accent}15`,
		};

		const content = <ThemedText style={styles.text}>{label}</ThemedText>;

		if (isTablet) {
			return (
				<TouchableOpacity
					style={[styles.item, selectedStyle]}
					onPress={() =>
						setSelected(item.id, "show", {
							title: item.title,
							date: item.date.toString(),
						})
					}>
					{content}
				</TouchableOpacity>
			);
		}

		return (
			<Link
				href={generateHref("viewShow", {
					id: item.id,
					title: item.title,
					date: item.date,
				})}
				asChild>
				<TouchableOpacity style={styles.item}>{content}</TouchableOpacity>
			</Link>
		);
	};

	return (
		<ThemedView style={styles.container}>
			<SectionList
				sections={sections}
				keyExtractor={(item) => item.id}
				renderSectionHeader={({ section: { title } }) => (
					<ThemedView
						style={{
							backgroundColor: colors.background,
							padding: 8,
							borderBottomWidth: 1,
							borderBottomColor: `${colors.text}45`,
							marginBottom: 4,
						}}>
						<ThemedText
							style={{ fontSize: 18, color: colors.text, fontWeight: "bold" }}>
							{title}
						</ThemedText>
					</ThemedView>
				)}
				stickySectionHeadersEnabled
				renderItem={renderItem}
			/>
		</ThemedView>
	);
}
