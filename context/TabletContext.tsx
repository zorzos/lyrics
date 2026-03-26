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
    setSelected: (id: string, type: SelectedType, meta?: SelectedMeta) => void;
    clearSelected: () => void;
}

const TabletContext = createContext<TabletContextType | undefined>(undefined);

export const TabletProvider = ({ children }: { children: React.ReactNode }) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<SelectedType>(null);
    const [selectedMeta, setSelectedMeta] = useState<SelectedMeta | null>(null);

    const setSelected = (id: string, type: SelectedType, meta?: SelectedMeta) => {
        setSelectedId(id);
        setSelectedType(type);
        setSelectedMeta(meta ?? null);
    };

    const clearSelected = () => {
        setSelectedId(null);
        setSelectedType(null);
        setSelectedMeta(null);
    };

    return (
        <TabletContext.Provider value={{ selectedId, selectedType, selectedMeta, setSelected, clearSelected }}>
            {children}
        </TabletContext.Provider>
    );
};

export const useTablet = () => {
    const context = useContext(TabletContext);
    if (!context) throw new Error("useTablet must be used within a TabletProvider");
    return context;
};