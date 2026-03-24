import { storage } from "@/utils/storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type HighlightStyle =
	| "background"
	| "underline"
	| "border"
	| "pills"
	| "none";

const DEFAULT_SETTINGS = {
	highlightStyle: "underline" as HighlightStyle,
};

interface SettingsContextType {
	highlightStyle: HighlightStyle;
	setHighlightStyle: (style: HighlightStyle) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
	undefined,
);

export const SettingsProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const [highlightStyle, setHighlightStyleState] = useState<HighlightStyle>(
		DEFAULT_SETTINGS.highlightStyle,
	);

	useEffect(() => {
		storage.get("highlightStyle").then((value) => {
			if (value) setHighlightStyleState(value as HighlightStyle);
		});
	}, []);

	const setHighlightStyle = (style: HighlightStyle) => {
		setHighlightStyleState(style);
		storage.set("highlightStyle", style);
	};

	return (
		<SettingsContext.Provider value={{ highlightStyle, setHighlightStyle }}>
			{children}
		</SettingsContext.Provider>
	);
};

export const useSettings = () => {
	const context = useContext(SettingsContext);
	if (!context)
		throw new Error("useSettings must be used within a SettingsProvider");
	return context;
};
