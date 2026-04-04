import React, { createContext, useContext, useState } from "react";

type SelectedType = "song" | "show" | null;

export type SelectedMeta = {
	title?: string;
	date?: string;
	[key: string]: unknown;
};

interface TabletContextType {
	selectedId: string | null;
	selectedType: SelectedType;
	selectedMeta: SelectedMeta | null;
	isEditing: boolean;
	isAdding: boolean;
	setSelected: (id: string, type: SelectedType, meta?: SelectedMeta) => void;
	clearSelected: () => void;
	setIsEditing: (value: boolean) => void;
	setIsAdding: (value: boolean, type?: SelectedType) => void;
}

const TabletContext = createContext<TabletContextType | undefined>(undefined);

export const TabletProvider = ({ children }: { children: React.ReactNode }) => {
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [selectedType, setSelectedType] = useState<SelectedType>(null);
	const [selectedMeta, setSelectedMeta] = useState<SelectedMeta | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [isAdding, setIsAddingState] = useState(false);

	const setSelected = (id: string, type: SelectedType, meta?: SelectedMeta) => {
		setSelectedId(id);
		setSelectedType(type);
		setSelectedMeta(meta ?? null);
		setIsEditing(false);
		setIsAddingState(false); // clear adding state when selecting an existing item
	};

	const clearSelected = () => {
		setSelectedId(null);
		setSelectedType(null);
		setSelectedMeta(null);
		setIsEditing(false);
		setIsAddingState(false);
	};

	const setIsAdding = (value: boolean, type?: SelectedType) => {
		setIsAddingState(value);
		if (value) {
			// clear any existing selection when starting to add
			setSelectedId(null);
			setSelectedMeta(null);
			setIsEditing(false);
			if (type) setSelectedType(type);
		}
	};

	return (
		<TabletContext.Provider
			value={{
				selectedId,
				selectedType,
				selectedMeta,
				isEditing,
				isAdding,
				setSelected,
				clearSelected,
				setIsEditing,
				setIsAdding,
			}}>
			{children}
		</TabletContext.Provider>
	);
};

export const useTablet = () => {
	const context = useContext(TabletContext);
	if (!context)
		throw new Error("useTablet must be used within a TabletProvider");
	return context;
};
