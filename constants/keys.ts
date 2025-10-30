import { MusicalKey } from "@/types";

export const getMusicalKeys = (backgroundColor: string, color: string): MusicalKey[] => [
    {
        label: "A", value: "A",
        containerStyle: { backgroundColor },
        labelStyle: { color }
    },
    {
        label: "A# / Bb", value: "A#",
        containerStyle: { backgroundColor },
        labelStyle: { color }
    },
    {
        label: "B", value: "B",
        containerStyle: { backgroundColor },
        labelStyle: { color }
    },
    {
        label: "C", value: "C",
        containerStyle: { backgroundColor },
        labelStyle: { color }
    },
    {
        label: "C# / Db", value: "C#",
        containerStyle: { backgroundColor },
        labelStyle: { color }
    },
    {
        label: "D", value: "D",
        containerStyle: { backgroundColor },
        labelStyle: { color }
    },
    {
        label: "D# / Eb", value: "D#",
        containerStyle: { backgroundColor },
        labelStyle: { color }
    },
    {
        label: "E", value: "E",
        containerStyle: { backgroundColor },
        labelStyle: { color }
    },
    {
        label: "F", value: "F",
        containerStyle: { backgroundColor },
        labelStyle: { color }
    },
    {
        label: "F# / Gb", value: "F#",
        containerStyle: { backgroundColor },
        labelStyle: { color }
    },
    {
        label: "G", value: "G",
        containerStyle: { backgroundColor },
        labelStyle: { color }
    },
    {
        label: "G# / Ab", value: "G#",
        containerStyle: { backgroundColor },
        labelStyle: { color }
    }
];