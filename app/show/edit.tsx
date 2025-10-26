import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { supabase } from "@/lib/supabase";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

export default function EditShowScreen() {
	const router = useRouter();
	const { id } = useLocalSearchParams(); // if id exists, we're editing

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [show, setShow] = useState({
		name: "",
		date: new Date(),
		notes: "",
		songs: [] as any[],
	});

	// Fetch existing show if editing
	useEffect(() => {
		const fetchShow = async () => {
			if (!id) {
				setLoading(false);
				return;
			}
			const { data, error } = await supabase
				.from("shows")
				.select(`id, name, date, notes, show_songs(song_order, songs(*))`)
				.eq("id", id)
				.single();
			if (!error && data) {
				setShow({
					name: data.name,
					date: new Date(data.date),
					notes: data.notes || "",
					songs:
						data.show_songs
							?.sort((a: any, b: any) => a.song_order - b.song_order)
							.map((ss: any) => ss.songs) ?? [],
				});
			}
			setLoading(false);
		};
		fetchShow();
	}, [id]);

	const handleSave = async () => {
		setSaving(true);
		let showId = id;

		if (id) {
			const { error } = await supabase
				.from("shows")
				.update({
					name: show.name,
					date: show.date.toISOString(),
					notes: show.notes,
				})
				.eq("id", id);
			if (error) console.error(error);
		} else {
			const { data, error } = await supabase
				.from("shows")
				.insert({
					name: show.name,
					date: show.date.toISOString(),
					notes: show.notes,
				})
				.select("id")
				.single();
			if (error) console.error(error);
			showId = data.id;
		}

		// update show_songs table
		await supabase.from("show_songs").delete().eq("show_id", showId);
		if (show.songs.length > 0) {
			const inserts = show.songs.map((song, index) => ({
				show_id: showId,
				song_id: song.id,
				song_order: index + 1,
			}));
			await supabase.from("show_songs").insert(inserts);
		}

		setSaving(false);
		router.back();
	};

	if (loading) return <ThemedText>Loading...</ThemedText>;

	return (
		<ThemedView style={styles.container}>
			<TextInput
				style={styles.input}
				placeholder="Show name"
				value={show.name}
				onChangeText={(text) => setShow({ ...show, name: text })}
			/>
			<DateTimePicker
				value={show.date}
				mode="date"
				display="default"
				onChange={(_, date) => setShow({ ...show, date: date || show.date })}
			/>
			<TextInput
				style={[styles.input, { height: 80 }]}
				multiline
				placeholder="Notes"
				value={show.notes}
				onChangeText={(text) => setShow({ ...show, notes: text })}
			/>

			<ThemedText style={{ marginTop: 16, marginBottom: 8 }}>Setlist</ThemedText>
			<FlatList
				data={show.songs}
				keyExtractor={(item) => item.id.toString()}
				renderItem={({ item }) => (
					<View style={styles.songItem}>
						<ThemedText>{item.title}</ThemedText>
					</View>
				)}
			/>

			<TouchableOpacity
				style={styles.addButton}
				onPress={() => console.log("TODO: open song selector modal")}
			>
				<ThemedText style={{ color: "#000" }}>+ Add Song</ThemedText>
			</TouchableOpacity>

			<TouchableOpacity
				style={[styles.saveButton, { opacity: saving ? 0.5 : 1 }]}
				onPress={handleSave}
				disabled={saving}
			>
				<ThemedText style={{ color: "#000" }}>{id ? "Save Changes" : "Create Show"}</ThemedText>
			</TouchableOpacity>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 16,
	},
	input: {
		borderWidth: 1,
		borderColor: "#555",
		borderRadius: 8,
		padding: 8,
		marginVertical: 6,
		color: "#fff",
	},
	songItem: {
		padding: 8,
		borderWidth: 1,
		borderColor: "#555",
		borderRadius: 8,
		marginVertical: 4,
	},
	addButton: {
		backgroundColor: "#eee",
		alignItems: "center",
		padding: 10,
		borderRadius: 8,
		marginTop: 8,
	},
	saveButton: {
		backgroundColor: "#fff",
		alignItems: "center",
		padding: 12,
		borderRadius: 8,
		marginTop: 16,
	},
});
