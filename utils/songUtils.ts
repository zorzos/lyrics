import { KeyInfo, KeyQuality } from "@/types";
import { XMLParser } from "fast-xml-parser";

export type Segment = {
	text: string;
	tags: string[];
};

export type LyricLine = Segment[];

export type LyricBlock = {
	type: string;
	order: number;
	repeatIndex: number;
	lines: LyricLine[];
};

const xmlParser = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: "",
	removeNSPrefix: true,
	preserveOrder: true,
	textNodeName: "#text",
	trimValues: false
});

function parseLineSegments(lineNode: any[]): LyricLine {
	const segments: Segment[] = [];

	for (const node of lineNode) {
		if ("#text" in node) {
			const text = String(node["#text"]);
			if (text) segments.push({ text, tags: [] });
		} else if ("span" in node) {
			const spanChildren = node["span"];
			const attrs = node[":@"] ?? {};
			const tagAttr = attrs["tag"] ?? "";
			const tags = tagAttr
				? tagAttr.split(",").map((t: string) => t.trim().toLowerCase())
				: [];
			const text = spanChildren
				.filter((n: any) => "#text" in n)
				.map((n: any) => String(n["#text"]))
				.join("");
			if (text) segments.push({ text, tags });
		}
	}

	return segments;
}

export function parseLyrics(xml: string): LyricBlock[] {
	let parsed;
	try {
		parsed = xmlParser.parse(xml);
	} catch (error) {
		console.error("Error parsing XML:", error);
		return [];
	}

	const lyricsNode = parsed.find((n: any) => "lyrics" in n);
	if (!lyricsNode) return [];

	const lyricChildren: any[] = lyricsNode["lyrics"];
	const blocks: LyricBlock[] = [];

	for (const child of lyricChildren) {
		const type = Object.keys(child).find((k) => k !== ":@");
		if (!type) continue;

		const attrs = child[":@"] ?? {};
		const order = Number(attrs["order"]) || 0;
		const repeat = Number(attrs["repeat"]) || 1;

		const rawLines = child[type];
		if (!Array.isArray(rawLines)) continue;
		const lineNodes = rawLines.filter((n: any) => "line" in n);

		const lines: LyricLine[] = lineNodes.map((lineNode: any) =>
			parseLineSegments(lineNode["line"]),
		);

		for (let i = 0; i < repeat; i++) {
			blocks.push({ type, order, repeatIndex: i + 1, lines });
		}
	}

	blocks.sort((a, b) => a.order - b.order);
	return blocks;
}

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
