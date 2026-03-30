import { ColorTheme, useColors } from "@/hooks/use-colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";

interface InfoBlockProps {
	label: string;
	value?: React.ReactNode;
	onPress?: () => void;
	width: number;
	custom?: React.ReactNode;
	opensModal?: boolean;
}

const createStyles = (colors: ColorTheme, width: number) =>
	StyleSheet.create({
		wrapper: {
			width,
			justifyContent: "center",
			alignItems: "center",
			borderWidth: 1,
			borderColor: colors.text,
			borderRadius: 8,
			padding: 4,
		},
	});

export default function InfoBlock({
	label,
	value,
	onPress,
	width,
	custom,
	opensModal,
}: InfoBlockProps) {
	const colors = useColors();
	const Wrapper: React.ElementType =
		onPress || opensModal ? TouchableOpacity : ThemedView;
	const wrapperStyles = createStyles(colors, width);

	if (custom) {
		return <ThemedView style={wrapperStyles.wrapper}>{custom}</ThemedView>;
	}

	return (
		<Wrapper
			onPress={onPress}
			style={wrapperStyles.wrapper}>
			<ThemedView
				style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
				<ThemedText style={{ fontSize: 16, textAlign: "center" }}>
					{label}
				</ThemedText>
				{opensModal && (
					<MaterialIcons
						color={colors.text}
						size={12}
						name="open-in-new"
					/>
				)}
			</ThemedView>
			{value && (
				<ThemedText style={{ fontSize: 16, textAlign: "center" }}>
					{value}
				</ThemedText>
			)}
		</Wrapper>
	);
}
