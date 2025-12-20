import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Button } from "react-native";

export default function Admin() {
	const [date, setDate] = useState(new Date());
	const [mode, setMode] = useState<any>("date");
	const [show, setShow] = useState(false);

	const onChange = (event: any, selectedDate: any) => {
		const currentDate = selectedDate;
		setShow(false);
		setDate(currentDate);
	};

	const showMode = (currentMode: any) => {
		setShow(true);
		setMode(currentMode);
	};

	const showDatepicker = () => {
		showMode("date");
	};

	const showTimepicker = () => {
		showMode("time");
	};

	return (
		<ThemedView style={{ flex: 1, padding: 20, display: "flex", gap: 10 }}>
			<ThemedText style={{ fontWeight: "bold" }}>
				Selected date: {date?.toDateString()}
			</ThemedText>
			<Button
				onPress={showDatepicker}
				title="Show date picker!"
			/>
			<Button
				onPress={showTimepicker}
				title="Show time picker!"
			/>
			{show && (
				<DateTimePicker
					testID="dateTimePicker"
					value={date}
					mode={mode}
					is24Hour={false}
					onChange={onChange}
				/>
			)}
		</ThemedView>
	);
}
