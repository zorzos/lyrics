import React from "react";
import {
	AutocompleteDropdown,
	AutocompleteDropdownContextProvider,
	AutocompleteDropdownItem,
} from "react-native-autocomplete-dropdown";

export default function MinimalAutocomplete() {
	const data: AutocompleteDropdownItem[] = [
		{ id: "1", title: "Artist 1" },
		{ id: "2", title: "Artist 2" },
		{ id: "3", title: "Test artist" },
		{ id: "4", title: "Another artist" },
	];

	return (
		<AutocompleteDropdownContextProvider>
			<AutocompleteDropdown
				dataSet={data}
				showChevron={true}
				closeOnBlur={false}
				suggestionsListMaxHeight={200}
				textInputProps={{
					placeholder: "Search...",
					autoCorrect: false,
				}}
			/>
		</AutocompleteDropdownContextProvider>
	);
}
