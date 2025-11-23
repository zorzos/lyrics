import { KeyInfo, KeyQuality } from "@/types";
import { XMLParser } from "fast-xml-parser";

const xmlParser = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: "",
	removeNSPrefix: true,
});

export function parseLyrics(xml: string) {
	let lyrics;
	try {
		lyrics = xmlParser.parse(xml).lyrics;
	} catch (error) {
		console.error("Error parsing XML:", error);
		return [];
	}

	if (!lyrics) return [];

	const blocks: any[] = [];
	for (const [key, value] of Object.entries(lyrics)) {
		const elements = Array.isArray(value) ? value : [value];

		for (const el of elements) {
			const order = Number(el.order) || 0;
			const repeat = Number(el.repeat) || 1;
			const lines = Array.isArray(el.line) ? el.line : [el.line];

			for (let i = 0; i < repeat; i++) {
				blocks.push({
					type: key,
					order,
					repeatIndex: i + 1,
					lines,
				});
			}
		}
	}

	blocks.sort((a, b) => a.order - b.order);
	return blocks;
}

export const normaliseLyric = (line: string | Record<string, unknown>) => {
	let lyric: string;
	if (typeof line === "string") {
		lyric = line;
	} else if (line && typeof line === "object" && "#text" in line) {
		const maybeText = (line as Record<string, unknown>)["#text"];
		lyric = typeof maybeText === "string" ? maybeText : String(maybeText ?? "");
	} else {
		lyric = "";
	}

	return lyric;
};

const keyToSemitone: Record<string, number> = {
	C: 0,
	"C#": 1,
	Db: 1,
	D: 2,
	"D#": 3,
	Eb: 3,
	E: 4,
	F: 5,
	"F#": 6,
	Gb: 6,
	G: 7,
	"G#": 8,
	Ab: 8,
	A: 9,
	"A#": 10,
	Bb: 10,
	B: 11,
};

const semitoneToKey: Record<number, string> = {
	0: "C",
	1: "C#",
	2: "D",
	3: "D#",
	4: "E",
	5: "F",
	6: "F#",
	7: "G",
	8: "G#",
	9: "A",
	10: "A#",
	11: "B",
};

/**
 * Parses and validates a key string.
 * Accepts major (C) and minor (Cm) forms, sharps (#), and flats (b).
 */
function parseKey(input: string): KeyInfo {
	if (!input) throw new Error("Key cannot be empty");

	const trimmed = input.trim();
	const quality: KeyQuality = trimmed.endsWith("m") ? "minor" : "major";
	const noteName = quality === "minor" ? trimmed.slice(0, -1) : trimmed;

	const semitone = keyToSemitone[noteName];
	if (semitone === undefined) throw new Error(`Invalid key: ${input}`);

	return {
		name: semitoneToKey[semitone], // normalize to standard sharp name
		quality,
		semitone,
	};
}

/**
 * Calculates signed semitone difference between two keys.
 */
export function semitoneDifference(originalKey: string, spKey: string): string {
	const k1 = parseKey(originalKey);
	const k2 = parseKey(spKey);

	let diff = k2.semitone - k1.semitone;
	if (diff > 6) diff -= 12;
	if (diff < -6) diff += 12;

	return diff > 0 ? `+${diff}` : `${diff}`;
}
